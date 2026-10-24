import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  FileText,
  Code2,
  Globe,
  Award,
  CheckCircle2,
  XCircle,
  Edit,
  X,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import AlertBanner from '../../../components/common/AlertBanner';
import { placementService } from '../../../services/api';

export const PlacementStudents = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [eligibilityFilter, setEligibilityFilter] = useState('ALL');

  // Edit modal
  const [editProfile, setEditProfile] = useState(null);
  const [editForm, setEditForm] = useState({
    cgpa: 8.5,
    activeBacklogs: 0,
    skillsStr: '',
    resumeUrl: '',
    isEligible: true,
    placementStatus: 'Unplaced',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await placementService.getStudents();
      if (res && res.success) {
        setProfiles(res.profiles || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch candidate profiles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && editProfile) {
        setEditProfile(null);
      }
    };
    if (editProfile) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editProfile]);

  // Filter profiles
  const filteredProfiles = profiles.filter((p) => {
    const matchesStatus = statusFilter === 'ALL' || p.placementStatus === statusFilter;
    const matchesElig =
      eligibilityFilter === 'ALL'
        ? true
        : eligibilityFilter === 'ELIGIBLE'
        ? p.isEligible
        : !p.isEligible;

    const q = searchQuery.toLowerCase();
    const name = p.student?.name || '';
    const id = p.student?.studentId || '';
    const dept = p.student?.department?.name || '';
    const skills = (p.technicalSkills || []).join(' ');

    const matchesSearch =
      name.toLowerCase().includes(q) ||
      id.toLowerCase().includes(q) ||
      dept.toLowerCase().includes(q) ||
      skills.toLowerCase().includes(q);

    return matchesStatus && matchesElig && matchesSearch;
  });

  const openEditModal = (p) => {
    setEditProfile(p);
    setEditForm({
      cgpa: p.cgpa || 8.0,
      activeBacklogs: p.activeBacklogs || 0,
      skillsStr: (p.technicalSkills || []).join(', '),
      resumeUrl: p.resumeUrl || '',
      isEligible: p.isEligible,
      placementStatus: p.placementStatus || 'Unplaced',
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editProfile) return;
    setSubmitting(true);
    try {
      const skillsArr = editForm.skillsStr.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await placementService.updateStudentProfile(editProfile._id, {
        cgpa: Number(editForm.cgpa),
        activeBacklogs: Number(editForm.activeBacklogs),
        technicalSkills: skillsArr,
        resumeUrl: editForm.resumeUrl,
        isEligible: editForm.isEligible,
        placementStatus: editForm.placementStatus,
      });

      if (res && res.success) {
        setSuccessMsg(`Profile for ${editProfile.student?.name} updated.`);
        setEditProfile(null);
        fetchStudents();
      }
    } catch (err) {
      alert(err.message || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16">
        <LoadingSpinner />
        <p className="mt-3 text-xs text-slate-500 font-medium">Loading graduating candidate records...</p>
      </div>
    );
  }

  const placedCount = profiles.filter((p) => p.placementStatus === 'Placed').length;
  const eligibleCount = profiles.filter((p) => p.isEligible).length;

  return (
    <div className="space-y-6">
      {error && (
        <AlertBanner
          variant="danger"
          title="Student Records Error"
          message={error}
          dismissible
          onDismiss={() => setError('')}
        />
      )}
      {successMsg && (
        <AlertBanner
          variant="success"
          title="Profile Updated"
          message={successMsg}
          dismissible
          onDismiss={() => setSuccessMsg('')}
        />
      )}

      {/* KPI Ribbons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#F1E7CF] shadow-xs">
          <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider block">Graduating Candidates</span>
          <span className="text-2xl font-bold font-mono text-[#111827] mt-1 block">{profiles.length}</span>
          <span className="text-xs text-[#4B5563] font-medium">Class of 2026 Batch</span>
        </div>
        <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#F1E7CF] shadow-xs">
          <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider block">Placement Eligible</span>
          <span className="text-2xl font-bold font-mono text-[#D99A00] mt-1 block">{eligibleCount}</span>
          <span className="text-xs text-[#D99A00] font-bold">CGPA &ge; 7.0 &amp; Zero Backlogs</span>
        </div>
        <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#F1E7CF] shadow-xs">
          <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider block">Offers Confirmed</span>
          <span className="text-2xl font-bold font-mono text-[#111827] mt-1 block">{placedCount} Placed</span>
          <span className="text-xs text-[#D99A00] font-bold">{Math.round((placedCount / (profiles.length || 1)) * 100)}% Placement Rate</span>
        </div>
        <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#F1E7CF] shadow-xs">
          <span className="text-xs font-bold text-[#4B5563] uppercase tracking-wider block">Active Pipeline</span>
          <span className="text-2xl font-bold font-mono text-[#111827] mt-1 block">
            {profiles.filter((p) => p.placementStatus === 'Interviewing' || p.placementStatus === 'Shortlisted').length}
          </span>
          <span className="text-xs text-[#4B5563] font-medium">Interviewing in current drives</span>
        </div>
      </div>

      {/* Candidate Profiles Master Table */}
      <Card
        title="Student Placement Profiles & Academic Records"
        subtitle="Cumulative CGPA, verified technical skill stacks, digital résumés, and institutional eligibility"
        headerAction={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search name, roll #, skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#D99A00] w-44 sm:w-56"
              />
            </div>

            <select
              value={eligibilityFilter}
              onChange={(e) => setEligibilityFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="ALL">All Candidates</option>
              <option value="ELIGIBLE">Eligible Only (&ge; 7.0)</option>
              <option value="INELIGIBLE">Ineligible</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="Placed">Placed</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Unplaced">Unplaced</option>
            </select>

            <Button variant="ghost" size="sm" onClick={fetchStudents} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
              Sync
            </Button>
          </div>
        }
      >
        {filteredProfiles.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No candidates found matching the selected filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FFFDF5] text-[#111827] font-bold border-b border-[#F1E7CF]">
                <tr>
                  <th className="p-3.5">Candidate Details</th>
                  <th className="p-3.5 text-center">CGPA & Backlogs</th>
                  <th className="p-3.5">Technical Competencies</th>
                  <th className="p-3.5 text-center">Eligibility</th>
                  <th className="p-3.5 text-center">Placement Status</th>
                  <th className="p-3.5">Credentials & Résumé</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProfiles.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <span className="font-bold text-slate-900 block text-sm">
                        {p.student?.name}
                      </span>
                      <span className="text-[11px] font-mono text-[#D99A00] block">
                        {p.student?.studentId} • {p.student?.department?.name || 'CSE'}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {p.student?.email}
                      </span>
                    </td>

                    <td className="p-3.5 text-center font-mono">
                      <span className="font-bold text-slate-900 text-sm block">
                        {p.cgpa ? p.cgpa.toFixed(2) : '8.00'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {p.activeBacklogs || 0} Backlogs
                      </span>
                    </td>

                    <td className="p-3.5 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {(p.technicalSkills || []).map((sk, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="p-3.5 text-center">
                      <Badge
                        variant={p.isEligible ? 'success' : 'danger'}
                        size="sm"
                        hasDot
                      >
                        {p.isEligible ? 'Eligible' : 'Ineligible'}
                      </Badge>
                    </td>

                    <td className="p-3.5 text-center">
                      <Badge
                        variant={
                          p.placementStatus === 'Placed'
                            ? 'success'
                            : p.placementStatus === 'Interviewing'
                            ? 'purple'
                            : p.placementStatus === 'Shortlisted'
                            ? 'teal'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {p.placementStatus}
                      </Badge>
                      {p.placedCompany && (
                        <span className="text-[10px] font-bold text-emerald-800 block mt-1">
                          {p.placedCompany} ({p.offeredCtc})
                        </span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        {p.resumeUrl && (
                          <a
                            href={p.resumeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#FFF8E6] border border-[#F1E7CF] text-[#111827] text-[11px] font-semibold hover:bg-[#FFF8E6] transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#D99A00]" />
                            Résumé PDF
                          </a>
                        )}
                        {p.githubUrl && (
                          <a
                            href={p.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-slate-400 hover:text-slate-800"
                            title="GitHub"
                          >
                            <Code2 className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {p.linkedinUrl && (
                          <a
                            href={p.linkedinUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-slate-400 hover:text-blue-700"
                            title="LinkedIn"
                          >
                            <Globe className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Edit className="w-3.5 h-3.5" />}
                        onClick={() => openEditModal(p)}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* MODAL: EDIT CANDIDATE PROFILE */}
      {editProfile && (
        <div
          className="fixed inset-0 z-50 bg-[#111827]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setEditProfile(null)}
        >
          <div
            className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#F1E7CF] relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setEditProfile(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#D99A00]" />
              Edit Candidate: {editProfile.student?.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Roll No: {editProfile.student?.studentId} • {editProfile.student?.department?.name}
            </p>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Cumulative CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={editForm.cgpa}
                    onChange={(e) => setEditForm({ ...editForm, cgpa: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Active Backlogs</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.activeBacklogs}
                    onChange={(e) => setEditForm({ ...editForm, activeBacklogs: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Technical Skills (Comma-separated)</label>
                <input
                  type="text"
                  value={editForm.skillsStr}
                  onChange={(e) => setEditForm({ ...editForm, skillsStr: e.target.value })}
                  placeholder="e.g. C++, React, Node.js, Docker, Distributed Systems"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Résumé PDF Link</label>
                <input
                  type="url"
                  value={editForm.resumeUrl}
                  onChange={(e) => setEditForm({ ...editForm, resumeUrl: e.target.value })}
                  placeholder="https://campusverse.edu/resumes/..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Placement Status</label>
                  <select
                    value={editForm.placementStatus}
                    onChange={(e) => setEditForm({ ...editForm, placementStatus: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value="Unplaced">Unplaced</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Placed">Placed</option>
                    <option value="Opted Out">Opted Out</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Drive Eligibility</label>
                  <select
                    value={editForm.isEligible ? 'true' : 'false'}
                    onChange={(e) => setEditForm({ ...editForm, isEligible: e.target.value === 'true' })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value="true">Eligible (&ge; 7.0 CGPA)</option>
                    <option value="false">Ineligible</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setEditProfile(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Candidate Profile'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlacementStudents;
