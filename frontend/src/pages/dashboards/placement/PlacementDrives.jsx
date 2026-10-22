import React, { useState, useEffect } from 'react';
import {
  Building2,
  Briefcase,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Mail,
  Phone,
  X,
  Award,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import AlertBanner from '../../../components/common/AlertBanner';
import { placementService } from '../../../services/api';

export const PlacementDrives = () => {
  const [activeTab, setActiveTab] = useState('drives'); // 'drives' | 'companies'
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [showAddDriveModal, setShowAddDriveModal] = useState(false);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [driveForm, setDriveForm] = useState({
    companyName: '',
    jobTitle: '',
    jobType: 'Full-Time',
    description: '',
    displayPackage: '₹ 24.0 LPA (CTC)',
    minCgpa: 7.5,
    maxBacklogs: 0,
    requiredSkills: 'Data Structures, C++, Python, System Design',
    eligibleDepartments: 'Computer Science & Engineering, Electronics & Communication',
    driveDate: '',
    applicationDeadline: '',
    venue: 'Auditorium 2 & Online HackerEarth Labs',
    evaluationRounds: 'Online Coding Test, Technical Interview 1, HR Discussion',
  });

  const [companyForm, setCompanyForm] = useState({
    name: '',
    industry: 'Software & Cloud Computing',
    website: '',
    contactEmail: '',
    contactPerson: '',
    contactPhone: '',
    location: 'Bangalore, India',
    tier: 'Tier 1 (Dream)',
    about: '',
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [drivesRes, companiesRes] = await Promise.all([
        placementService.getDrives(),
        placementService.getCompanies(),
      ]);

      if (drivesRes && drivesRes.success) setDrives(drivesRes.drives || []);
      if (companiesRes && companiesRes.success) setCompanies(companiesRes.companies || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch recruitment drives.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter drives
  const filteredDrives = drives.filter((d) => {
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (d.companyName || '').toLowerCase().includes(q) ||
      (d.jobTitle || '').toLowerCase().includes(q) ||
      (d.venue || '').toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  // Filter companies
  const filteredCompanies = companies.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.industry || '').toLowerCase().includes(q) ||
      (c.location || '').toLowerCase().includes(q)
    );
  });

  // Handle Create Drive
  const handleCreateDrive = async (e) => {
    e.preventDefault();
    if (!driveForm.companyName || !driveForm.jobTitle || !driveForm.driveDate || !driveForm.applicationDeadline) {
      alert('Company, Job Title, Drive Date, and Deadline are required.');
      return;
    }
    setSubmitting(true);
    try {
      const skillsArr = driveForm.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean);
      const roundsArr = driveForm.evaluationRounds.split(',').map((r) => r.trim()).filter(Boolean);
      const deptsArr = driveForm.eligibleDepartments.split(',').map((d) => d.trim()).filter(Boolean);

      const res = await placementService.createDrive({
        companyName: driveForm.companyName,
        jobTitle: driveForm.jobTitle,
        jobType: driveForm.jobType,
        description: driveForm.description,
        displayPackage: driveForm.displayPackage,
        minCgpa: Number(driveForm.minCgpa),
        maxBacklogs: Number(driveForm.maxBacklogs),
        requiredSkills: skillsArr,
        eligibleDepartments: deptsArr,
        driveDate: driveForm.driveDate,
        applicationDeadline: driveForm.applicationDeadline,
        venue: driveForm.venue,
        evaluationRounds: roundsArr,
      });

      if (res && res.success) {
        setSuccessMsg(`Placement drive for ${driveForm.companyName} scheduled successfully.`);
        setShowAddDriveModal(false);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to schedule drive.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Create Company
  const handleCreateCompany = async (e) => {
    e.preventDefault();
    if (!companyForm.name || !companyForm.industry) {
      alert('Company name and industry are required.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await placementService.createCompany(companyForm);
      if (res && res.success) {
        setSuccessMsg(`Corporate partner ${companyForm.name} registered.`);
        setShowAddCompanyModal(false);
        setCompanyForm({
          name: '',
          industry: 'Software & Cloud Computing',
          website: '',
          contactEmail: '',
          contactPerson: '',
          contactPhone: '',
          location: 'Bangalore, India',
          tier: 'Tier 1 (Dream)',
          about: '',
        });
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Failed to register company.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && drives.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16">
        <LoadingSpinner />
        <p className="mt-3 text-xs text-slate-500 font-medium">Loading corporate partners & placement drives...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <AlertBanner
          variant="danger"
          title="Drive Management Error"
          message={error}
          dismissible
          onDismiss={() => setError('')}
        />
      )}
      {successMsg && (
        <AlertBanner
          variant="success"
          title="Operation Confirmed"
          message={successMsg}
          dismissible
          onDismiss={() => setSuccessMsg('')}
        />
      )}

      {/* Tabs & Top Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#F1E7CF] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('drives')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'drives'
                ? 'bg-[#D99A00] text-[#FFFFFF] shadow-sm'
                : 'text-[#111827] hover:text-[#111827] hover:bg-[#FFF8E6]'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Job Openings & Drives
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'drives' ? 'bg-[#FFFFFF]/20 text-[#FFFFFF]' : 'bg-[#FFF8E6] text-[#111827]'
            }`}>
              {drives.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('companies')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'companies'
                ? 'bg-[#D99A00] text-[#FFFFFF] shadow-sm'
                : 'text-[#111827] hover:text-[#111827] hover:bg-[#FFF8E6]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Corporate Hiring Partners
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'companies' ? 'bg-[#FFFFFF]/20 text-[#FFFFFF]' : 'bg-[#FFF8E6] text-[#111827]'
            }`}>
              {companies.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'drives' ? (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setShowAddDriveModal(true)}
            >
              Schedule Drive
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setShowAddCompanyModal(true)}
            >
              Register Partner
            </Button>
          )}
        </div>
      </div>

      {/* TAB 1: PLACEMENT DRIVES */}
      {activeTab === 'drives' && (
        <Card
          title="Placement Drives & Corporate Openings"
          subtitle="Salary packages, minimum CGPA requirements, required technical competencies, and drive timelines"
          headerAction={
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search drive or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#D99A00] w-44"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
              >
                <option value="ALL">All Statuses</option>
                <option value="Registration Open">Registration Open</option>
                <option value="Upcoming">Upcoming</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          }
        >
          {filteredDrives.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No placement drives found matching search criteria.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDrives.map((d) => (
                <div
                  key={d._id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-[#F1E7CF] transition-all shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#FFF8E6] border border-[#F1E7CF] flex items-center justify-center font-bold text-[#111827] text-lg shrink-0">
                        {d.companyName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{d.companyName}</h4>
                          <Badge variant="teal" size="sm">{d.jobType}</Badge>
                        </div>
                        <span className="text-xs font-semibold text-[#D99A00] block mt-0.5">{d.jobTitle}</span>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 leading-relaxed">{d.description}</p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Compensation</span>
                      <span className="text-base font-bold font-mono text-slate-900">{d.salaryPackage?.displayPackage}</span>
                      <div className="mt-1">
                        <Badge
                          variant={d.status === 'Registration Open' ? 'success' : 'neutral'}
                          size="sm"
                          hasDot
                        >
                          {d.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Skills & Eligibility Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-200/60">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Eligibility Mandate</span>
                      <div className="font-semibold text-slate-800 mt-0.5">
                        Min CGPA: <span className="font-mono text-[#D99A00]">{d.eligibilityCriteria?.minCgpa || 7.0}</span> • Max {d.eligibilityCriteria?.maxBacklogs || 0} Backlog
                      </div>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {(d.eligibilityCriteria?.eligibleDepartments || []).join(', ')}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Required Competencies</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(d.requiredSkills || []).map((sk, idx) => (
                          <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-mono">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Drive Schedule & Venue</span>
                      <div className="font-mono font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(d.driveDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block truncate">{d.venue}</span>
                    </div>
                  </div>

                  {/* Evaluation Rounds & Deadlines */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1">
                    <div className="flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>
                        Deadline: {new Date(d.applicationDeadline).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">Rounds:</span>
                      <span className="text-slate-600 font-mono">
                        {(d.evaluationRounds || []).join(' ➔ ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* TAB 2: CORPORATE HIRING PARTNERS */}
      {activeTab === 'companies' && (
        <Card
          title="Registered Corporate Hiring Partners"
          subtitle="Directory of MNCs, unicorn tech startups, and enterprise consulting recruiters"
          headerAction={
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#D99A00] w-44"
              />
            </div>
          }
        >
          {filteredCompanies.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No corporate partners registered.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCompanies.map((c) => (
                <div
                  key={c._id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-[#F1E7CF] transition-all shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FFF8E6] border border-[#F1E7CF] flex items-center justify-center font-bold text-[#111827]">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{c.name}</h4>
                        <span className="text-xs text-slate-500">{c.industry}</span>
                      </div>
                    </div>
                    <Badge variant="teal" size="sm">{c.tier}</Badge>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {c.about || 'Corporate recruiter partnering with CampusVerse university graduates.'}
                  </p>

                  <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#D99A00] shrink-0" />
                      <span className="truncate">{c.location}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#D99A00] shrink-0" />
                      <span className="truncate">{c.contactEmail || 'campus@recruiter.com'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* MODAL: SCHEDULE DRIVE */}
      {showAddDriveModal && (
        <div className="fixed inset-0 z-50 bg-[#111827]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#F1E7CF] relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAddDriveModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#D99A00]" />
              Schedule Campus Placement Drive
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Post an active job opening with eligibility criteria and drive timeline.</p>

            <form onSubmit={handleCreateDrive} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Company Name *</label>
                  <input
                    required
                    type="text"
                    value={driveForm.companyName}
                    onChange={(e) => setDriveForm({ ...driveForm, companyName: e.target.value })}
                    placeholder="e.g. Amazon Web Services"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Job Title *</label>
                  <input
                    required
                    type="text"
                    value={driveForm.jobTitle}
                    onChange={(e) => setDriveForm({ ...driveForm, jobTitle: e.target.value })}
                    placeholder="e.g. SDE-1 (Cloud Systems)"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Job Type</label>
                  <select
                    value={driveForm.jobType}
                    onChange={(e) => setDriveForm({ ...driveForm, jobType: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Internship + PPO">Internship + PPO</option>
                    <option value="Internship (6 Months)">Internship (6 Months)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">CTC Package Display *</label>
                  <input
                    required
                    type="text"
                    value={driveForm.displayPackage}
                    onChange={(e) => setDriveForm({ ...driveForm, displayPackage: e.target.value })}
                    placeholder="e.g. ₹ 28.0 LPA (CTC)"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Min CGPA Required</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={driveForm.minCgpa}
                    onChange={(e) => setDriveForm({ ...driveForm, minCgpa: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Max Active Backlogs</label>
                  <input
                    type="number"
                    min="0"
                    value={driveForm.maxBacklogs}
                    onChange={(e) => setDriveForm({ ...driveForm, maxBacklogs: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Required Skills (Comma-separated)</label>
                <input
                  type="text"
                  value={driveForm.requiredSkills}
                  onChange={(e) => setDriveForm({ ...driveForm, requiredSkills: e.target.value })}
                  placeholder="e.g. C++, Python, Data Structures, System Design"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Drive Date *</label>
                  <input
                    required
                    type="date"
                    value={driveForm.driveDate}
                    onChange={(e) => setDriveForm({ ...driveForm, driveDate: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Application Deadline *</label>
                  <input
                    required
                    type="date"
                    value={driveForm.applicationDeadline}
                    onChange={(e) => setDriveForm({ ...driveForm, applicationDeadline: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Assessment Venue / Platform</label>
                <input
                  type="text"
                  value={driveForm.venue}
                  onChange={(e) => setDriveForm({ ...driveForm, venue: e.target.value })}
                  placeholder="e.g. Auditorium 2 & Online HackerEarth"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setShowAddDriveModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submitting}>
                  {submitting ? 'Scheduling...' : 'Confirm & Schedule Drive'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER COMPANY */}
      {showAddCompanyModal && (
        <div className="fixed inset-0 z-50 bg-[#111827]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#F1E7CF] relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAddCompanyModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#D99A00]" />
              Register Corporate Partner
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Add an enterprise recruiter or hiring organization.</p>

            <form onSubmit={handleCreateCompany} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Company Name *</label>
                <input
                  required
                  type="text"
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  placeholder="e.g. NVIDIA India"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Industry Sector *</label>
                  <input
                    required
                    type="text"
                    value={companyForm.industry}
                    onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                    placeholder="e.g. Semiconductors & AI Hardware"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Company Tier</label>
                  <select
                    value={companyForm.tier}
                    onChange={(e) => setCompanyForm({ ...companyForm, tier: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value="Tier 1 (Dream)">Tier 1 (Dream)</option>
                    <option value="Tier 2 (Super Dream)">Tier 2 (Super Dream)</option>
                    <option value="Standard Corporate">Standard Corporate</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={companyForm.contactEmail}
                    onChange={(e) => setCompanyForm({ ...companyForm, contactEmail: e.target.value })}
                    placeholder="campus-hiring@company.com"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Office Location</label>
                  <input
                    type="text"
                    value={companyForm.location}
                    onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })}
                    placeholder="Bangalore / Hyderabad"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setShowAddCompanyModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={submitting}>
                  {submitting ? 'Registering...' : 'Register Partner'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlacementDrives;
