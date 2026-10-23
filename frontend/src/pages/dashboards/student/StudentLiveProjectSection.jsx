import React, { useState, useEffect, useCallback } from 'react';
import {
  Code,
  Globe,
  GitBranch,
  PlusCircle,
  Edit3,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Layers,
  Award,
  Loader2,
  RefreshCw,
  AlertCircle,
  Send,
  Trash2,
  Star,
} from 'lucide-react';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import { projectService } from '../../../services/api';

const PROJECT_CATEGORIES = [
  'Full-Stack Web',
  'Mobile App',
  'AI & Machine Learning',
  'Cloud & DevOps',
  'IoT & Embedded',
  'Cybersecurity',
  'Open Source',
  'Other',
];

export const StudentLiveProjectSection = ({ profile }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    liveUrl: '',
    githubUrl: '',
    technologies: '',
    category: 'Full-Stack Web',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await projectService.getMyProjects();
      if (res?.success) {
        setProjects(res.projects || res.data || []);
      } else {
        setError('Failed to load project portfolio.');
      }
    } catch (err) {
      setError(err?.message || 'Error communicating with project portfolio service.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleOpenCreateModal = () => {
    setEditingProject(null);
    setForm({
      title: '',
      description: '',
      liveUrl: '',
      githubUrl: '',
      technologies: '',
      category: 'Full-Stack Web',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEditModal = (proj) => {
    setEditingProject(proj);
    setForm({
      title: proj.title || '',
      description: proj.description || '',
      liveUrl: proj.liveUrl || '',
      githubUrl: proj.githubUrl || '',
      technologies: Array.isArray(proj.technologies) ? proj.technologies.join(', ') : '',
      category: proj.category || 'Full-Stack Web',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingProject(null);
    setFormErrors({});
  };

  const validateForm = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Project title is required.';
    if (!form.description.trim()) errs.description = 'Project description is required.';
    if (!form.liveUrl.trim()) {
      errs.liveUrl = 'Live deployed project URL is required.';
    } else {
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?(\?.*)?$/i;
      if (!urlPattern.test(form.liveUrl.trim())) {
        errs.liveUrl = 'Please enter a valid live website or deployment URL (e.g. https://myproject.vercel.app).';
      }
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setSubmitting(true);
    setFormErrors({});

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        liveUrl: form.liveUrl.trim(),
        githubUrl: form.githubUrl.trim(),
        technologies: form.technologies,
        category: form.category,
      };

      let res;
      if (editingProject) {
        res = await projectService.updateProject(editingProject._id, payload);
      } else {
        res = await projectService.createProject(payload);
      }

      if (res?.success) {
        setSuccessMsg(
          editingProject
            ? 'Project details updated successfully!'
            : 'Project successfully submitted for faculty evaluation!'
        );
        handleCloseModal();
        fetchProjects();
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setFormErrors({ submit: res?.error || 'Operation failed.' });
      }
    } catch (err) {
      setFormErrors({ submit: err?.message || err?.error || 'Failed to submit project.' });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Reviewed':
        return <Badge variant="teal" size="sm" hasDot>Reviewed & Evaluated</Badge>;
      case 'Changes Required':
        return <Badge variant="warning" size="sm" hasDot>Changes Required</Badge>;
      default:
        return <Badge variant="neutral" size="sm" hasDot>Pending Faculty Review</Badge>;
    }
  };

  return (
    <section id="live-projects" className="scroll-mt-20 space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#111827]">Live Project Portfolio</h2>
            <Badge variant="teal" size="sm">Portfolio Showcase</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-0.5 font-medium">
            Submit deployed live project URLs, code repositories, and view faculty evaluation feedback
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            onClick={fetchProjects}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
            onClick={handleOpenCreateModal}
          >
            Submit Live Project
          </Button>
        </div>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 font-medium">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          {error}
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-800 font-bold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Project Cards List */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-7 h-7 text-[#D99A00] animate-spin" />
          <p className="text-xs text-[#4B5563] font-medium">Loading project portfolio...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 px-4 border border-dashed border-[#F1E7CF] rounded-2xl bg-[#FFFDF5]">
          <Code className="w-12 h-12 text-[#D99A00] mx-auto mb-3 opacity-70" />
          <h3 className="text-base font-extrabold text-[#111827]">No Live Projects Submitted Yet</h3>
          <p className="text-xs text-[#4B5563] mt-1.5 max-w-md mx-auto font-medium">
            Showcase your deployed web applications, mobile apps, or AI models to faculty for academic credit and placement portfolios.
          </p>
          <Button
            variant="primary"
            size="sm"
            className="mt-4"
            leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
            onClick={handleOpenCreateModal}
          >
            Submit Your First Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => {
            const hasReview = proj.reviewStatus === 'Reviewed' || proj.review?.feedback;
            const canEdit = proj.reviewStatus !== 'Reviewed';

            return (
              <div
                key={proj._id}
                className="p-5 rounded-2xl bg-white border border-[#F1E7CF] hover:border-[#D99A00]/60 transition-all shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Bar: Category & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-[#D99A00] uppercase tracking-wider bg-[#FFF8E6] px-2.5 py-0.5 rounded-md border border-[#F1E7CF]">
                      {proj.category || 'Full-Stack Web'}
                    </span>
                    {getStatusBadge(proj.reviewStatus)}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-extrabold text-[#111827]">{proj.title}</h3>
                    <p className="text-xs text-[#4B5563] mt-1 font-medium leading-relaxed whitespace-pre-line">
                      {proj.description}
                    </p>
                  </div>

                  {/* Tech stack tags */}
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {proj.technologies.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-[#FFFDF5] border border-[#F1E7CF] text-[#111827] font-mono font-bold"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Live & Github Links */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F1E7CF]">
                    {proj.liveUrl && (
                      <a
                        href={proj.liveUrl.startsWith('http') ? proj.liveUrl : `https://${proj.liveUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF8E6] hover:bg-[#D99A00] text-[#D99A00] hover:text-white border border-[#D99A00] text-xs font-bold transition-all shadow-2xs"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        Live Website
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl.startsWith('http') ? proj.githubUrl : `https://${proj.githubUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold transition-all"
                      >
                        <GitBranch className="w-3.5 h-3.5" />
                        Repository
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* Faculty Review Box */}
                  {hasReview && (
                    <div className="p-3.5 rounded-xl bg-[#FFFDF5] border border-[#D99A00]/40 text-xs space-y-2 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#D99A00] uppercase text-[10px] tracking-wider flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" />
                          Faculty Review Feedback
                        </span>
                        {proj.review?.marks !== undefined && proj.review?.marks !== null && (
                          <span className="font-mono font-extrabold text-[#111827] text-xs">
                            Score: {proj.review.marks} / 100
                          </span>
                        )}
                      </div>

                      {proj.review?.feedback && (
                        <p className="text-[#374151] font-medium leading-relaxed">
                          <strong>Comments:</strong> {proj.review.feedback}
                        </p>
                      )}

                      {proj.review?.suggestions && (
                        <p className="text-amber-900 text-[11px] font-medium leading-relaxed bg-amber-50/70 p-2 rounded-lg border border-amber-200">
                          <strong>Improvement Suggestions:</strong> {proj.review.suggestions}
                        </p>
                      )}

                      {proj.review?.facultyName && (
                        <div className="text-[10px] text-[#6B7280] pt-1 border-t border-[#F1E7CF]">
                          Evaluated by: <span className="font-semibold text-[#111827]">{proj.review.facultyName}</span> &bull; {new Date(proj.review.reviewedAt || proj.updatedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Edit Button */}
                {canEdit && (
                  <div className="pt-2 border-t border-[#F1E7CF] flex justify-end">
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                      onClick={() => handleOpenEditModal(proj)}
                    >
                      Edit Project Details
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Submit / Edit Project Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          title={editingProject ? `Edit Project: ${editingProject.title}` : 'Submit Live Project'}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {formErrors.submit && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {formErrors.submit}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1">
                Project Title *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. AI-Powered Campus Recruitment Portal"
                className="w-full text-xs p-2.5 rounded-xl border border-[#F1E7CF] focus:outline-none focus:border-[#D99A00] font-sans"
              />
              {formErrors.title && <span className="text-[11px] text-red-600 mt-0.5 block">{formErrors.title}</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#F1E7CF] focus:outline-none focus:border-[#D99A00] font-sans bg-white"
                >
                  {PROJECT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1">
                  Technologies Used
                </label>
                <input
                  type="text"
                  value={form.technologies}
                  onChange={(e) => setForm({ ...form, technologies: e.target.value })}
                  placeholder="e.g. React, Node.js, MongoDB, Tailwind"
                  className="w-full text-xs p-2.5 rounded-xl border border-[#F1E7CF] focus:outline-none focus:border-[#D99A00] font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1">
                Live Project / Deployment Link *
              </label>
              <input
                type="text"
                value={form.liveUrl}
                onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
                placeholder="https://myproject.vercel.app or https://demo.campusverse.ai"
                className="w-full text-xs p-2.5 rounded-xl border border-[#F1E7CF] focus:outline-none focus:border-[#D99A00] font-sans"
              />
              {formErrors.liveUrl && <span className="text-[11px] text-red-600 mt-0.5 block">{formErrors.liveUrl}</span>}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1">
                Source Code / GitHub Link (Optional)
              </label>
              <input
                type="text"
                value={form.githubUrl}
                onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                placeholder="https://github.com/username/repository"
                className="w-full text-xs p-2.5 rounded-xl border border-[#F1E7CF] focus:outline-none focus:border-[#D99A00] font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1">
                Project Description & Features *
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Summarize the core problem solved, architecture, user features, and deployment instructions..."
                rows={4}
                className="w-full text-xs p-2.5 rounded-xl border border-[#F1E7CF] focus:outline-none focus:border-[#D99A00] font-sans"
              />
              {formErrors.description && <span className="text-[11px] text-red-600 mt-0.5 block">{formErrors.description}</span>}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#F1E7CF]">
              <Button variant="secondary" size="sm" type="button" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                leftIcon={submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : editingProject ? 'Update Details' : 'Submit Project'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
};

export default StudentLiveProjectSection;
