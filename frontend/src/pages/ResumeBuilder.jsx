import { useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

const ResumeBuilder = () => {
  const [loading, setLoading] = useState(false);

  const [resume, setResume] = useState({
    personal: {
      name: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
    },

    summary: "",

    education: [
      {
        degree: "",
        college: "",
        year: "",
        cgpa: "",
      },
    ],

    skills: {
      technical: "",
      soft: "",
      tools: "",
    },

    projects: [
      {
        title: "",
        description: "",
        technologies: "",
      },
    ],

    experience: [
      {
        company: "",
        role: "",
        duration: "",
        description: "",
      },
    ],
  });

  const updatePersonal = (field, value) => {
    setResume((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value,
      },
    }));
  };

  const updateField = (section, field, value) => {
    setResume((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const updateArray = (
    section,
    index,
    field,
    value
  ) => {
    setResume((prev) => ({
      ...prev,
      [section]: prev[section].map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      ),
    }));
  };

  const generateSummary = async () => {
    if (!resume.personal.name) {
      toast.error("Enter your name first");
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.post(
        "/resume/ai-summary",
        {
          resume,
        }
      );

      setResume((prev) => ({
        ...prev,
        summary: data.summary,
      }));

      toast.success("AI summary generated");
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "AI generation failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const improveProject = async (index) => {
    const project = resume.projects[index];

    if (!project.title || !project.description) {
      toast.error(
        "Add project title and description first"
      );
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.post(
        "/resume/ai-project",
        {
          project,
        }
      );

      updateArray(
        "projects",
        index,
        "description",
        data.description
      );

      toast.success("Project improved by AI");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "AI generation failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const addProject = () => {
    setResume((prev) => ({
      ...prev,

      projects: [
        ...prev.projects,
        {
          title: "",
          description: "",
          technologies: "",
        },
      ],
    }));
  };

  const addEducation = () => {
    setResume((prev) => ({
      ...prev,

      education: [
        ...prev.education,
        {
          degree: "",
          college: "",
          year: "",
          cgpa: "",
        },
      ],
    }));
  };

  const addExperience = () => {
    setResume((prev) => ({
      ...prev,

      experience: [
        ...prev.experience,
        {
          company: "",
          role: "",
          duration: "",
          description: "",
        },
      ],
    }));
  };

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500/60 focus:bg-white/[0.06]";

  const labelClass =
    "mb-2 block text-xs font-semibold text-slate-400";

  return (
    <div className="min-h-screen bg-[#070B14] px-4 py-8 text-white md:px-8">

      <div className="mx-auto max-w-7xl">

        {/* ================= HEADER ================= */}

        <div className="mb-8">

          <div className="flex items-center gap-2">

            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              ✦
            </span>

            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-400">
              AI powered
            </span>

          </div>

          <h1 className="mt-4 font-[Space_Grotesk] text-3xl font-bold md:text-4xl">
            Resume Builder
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Build a professional, ATS-friendly resume
            with the help of AI.
          </p>

        </div>


        {/* ================= MAIN ================= */}

        <div className="grid gap-6 lg:grid-cols-2">

          {/* =================================================
              LEFT FORM
          ================================================= */}

          <div className="space-y-5">


            {/* PERSONAL */}

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">

              <div className="mb-6">

                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                  01
                </p>

                <h2 className="mt-1 text-lg font-bold">
                  Personal information
                </h2>

              </div>

              <div className="grid gap-4 md:grid-cols-2">

                <div>
                  <label className={labelClass}>
                    Full name
                  </label>

                  <input
                    className={inputClass}
                    placeholder="Mohd Ali Bakhtiyar"
                    value={resume.personal.name}
                    onChange={(e) =>
                      updatePersonal(
                        "name",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Email
                  </label>

                  <input
                    className={inputClass}
                    placeholder="you@example.com"
                    value={resume.personal.email}
                    onChange={(e) =>
                      updatePersonal(
                        "email",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Phone
                  </label>

                  <input
                    className={inputClass}
                    placeholder="+91 9876543210"
                    value={resume.personal.phone}
                    onChange={(e) =>
                      updatePersonal(
                        "phone",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Location
                  </label>

                  <input
                    className={inputClass}
                    placeholder="Delhi, India"
                    value={resume.personal.location}
                    onChange={(e) =>
                      updatePersonal(
                        "location",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    LinkedIn
                  </label>

                  <input
                    className={inputClass}
                    placeholder="linkedin.com/in/username"
                    value={resume.personal.linkedin}
                    onChange={(e) =>
                      updatePersonal(
                        "linkedin",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    GitHub
                  </label>

                  <input
                    className={inputClass}
                    placeholder="github.com/username"
                    value={resume.personal.github}
                    onChange={(e) =>
                      updatePersonal(
                        "github",
                        e.target.value
                      )
                    }
                  />
                </div>

              </div>

            </section>


            {/* SUMMARY */}

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">

              <div className="mb-5 flex items-center justify-between">

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                    02
                  </p>

                  <h2 className="mt-1 text-lg font-bold">
                    Professional summary
                  </h2>

                </div>

                <button
                  onClick={generateSummary}
                  disabled={loading}
                  className="rounded-xl bg-indigo-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-400 disabled:opacity-50"
                >
                  {loading
                    ? "Generating..."
                    : "✦ Generate with AI"}
                </button>

              </div>

              <textarea
                rows="5"
                className={inputClass}
                placeholder="Write a short professional summary or let AI generate it..."
                value={resume.summary}
                onChange={(e) =>
                  setResume((prev) => ({
                    ...prev,
                    summary: e.target.value,
                  }))
                }
              />

            </section>


            {/* SKILLS */}

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">

              <div className="mb-6">

                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                  03
                </p>

                <h2 className="mt-1 text-lg font-bold">
                  Skills
                </h2>

              </div>

              <div className="space-y-4">

                <div>

                  <label className={labelClass}>
                    Technical skills
                  </label>

                  <input
                    className={inputClass}
                    placeholder="JavaScript, React, Node.js, MongoDB..."
                    value={resume.skills.technical}
                    onChange={(e) =>
                      updateField(
                        "skills",
                        "technical",
                        e.target.value
                      )
                    }
                  />

                </div>

                <div>

                  <label className={labelClass}>
                    Tools & technologies
                  </label>

                  <input
                    className={inputClass}
                    placeholder="Git, GitHub, Postman, VS Code..."
                    value={resume.skills.tools}
                    onChange={(e) =>
                      updateField(
                        "skills",
                        "tools",
                        e.target.value
                      )
                    }
                  />

                </div>

                <div>

                  <label className={labelClass}>
                    Soft skills
                  </label>

                  <input
                    className={inputClass}
                    placeholder="Communication, Leadership, Problem Solving..."
                    value={resume.skills.soft}
                    onChange={(e) =>
                      updateField(
                        "skills",
                        "soft",
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>

            </section>


            {/* EDUCATION */}

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">

              <div className="mb-6 flex items-center justify-between">

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                    04
                  </p>

                  <h2 className="mt-1 text-lg font-bold">
                    Education
                  </h2>

                </div>

                <button
                  onClick={addEducation}
                  className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 hover:text-white"
                >
                  + Add
                </button>

              </div>

              {resume.education.map(
                (education, index) => (

                  <div
                    key={index}
                    className="mb-5 grid gap-4 border-b border-white/5 pb-5 md:grid-cols-2"
                  >

                    <input
                      className={inputClass}
                      placeholder="Degree"
                      value={education.degree}
                      onChange={(e) =>
                        updateArray(
                          "education",
                          index,
                          "degree",
                          e.target.value
                        )
                      }
                    />

                    <input
                      className={inputClass}
                      placeholder="College / University"
                      value={education.college}
                      onChange={(e) =>
                        updateArray(
                          "education",
                          index,
                          "college",
                          e.target.value
                        )
                      }
                    />

                    <input
                      className={inputClass}
                      placeholder="2023 - 2027"
                      value={education.year}
                      onChange={(e) =>
                        updateArray(
                          "education",
                          index,
                          "year",
                          e.target.value
                        )
                      }
                    />

                    <input
                      className={inputClass}
                      placeholder="CGPA / Percentage"
                      value={education.cgpa}
                      onChange={(e) =>
                        updateArray(
                          "education",
                          index,
                          "cgpa",
                          e.target.value
                        )
                      }
                    />

                  </div>

                )
              )}

            </section>


            {/* PROJECTS */}

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">

              <div className="mb-6 flex items-center justify-between">

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                    05
                  </p>

                  <h2 className="mt-1 text-lg font-bold">
                    Projects
                  </h2>

                </div>

                <button
                  onClick={addProject}
                  className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 hover:text-white"
                >
                  + Add
                </button>

              </div>

              {resume.projects.map(
                (project, index) => (

                  <div
                    key={index}
                    className="mb-5 space-y-4 border-b border-white/5 pb-5"
                  >

                    <input
                      className={inputClass}
                      placeholder="Project title"
                      value={project.title}
                      onChange={(e) =>
                        updateArray(
                          "projects",
                          index,
                          "title",
                          e.target.value
                        )
                      }
                    />

                    <textarea
                      rows="4"
                      className={inputClass}
                      placeholder="Describe what you built..."
                      value={project.description}
                      onChange={(e) =>
                        updateArray(
                          "projects",
                          index,
                          "description",
                          e.target.value
                        )
                      }
                    />

                    <div className="flex gap-3">

                      <input
                        className={inputClass}
                        placeholder="React, Node.js, MongoDB..."
                        value={project.technologies}
                        onChange={(e) =>
                          updateArray(
                            "projects",
                            index,
                            "technologies",
                            e.target.value
                          )
                        }
                      />

                      <button
                        onClick={() =>
                          improveProject(index)
                        }
                        className="shrink-0 rounded-xl bg-indigo-500/10 px-4 text-xs font-bold text-indigo-400 hover:bg-indigo-500/20"
                      >
                        ✦ AI Improve
                      </button>

                    </div>

                  </div>

                )
              )}

            </section>


            {/* EXPERIENCE */}

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">

              <div className="mb-6 flex items-center justify-between">

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                    06
                  </p>

                  <h2 className="mt-1 text-lg font-bold">
                    Experience
                  </h2>

                </div>

                <button
                  onClick={addExperience}
                  className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 hover:text-white"
                >
                  + Add
                </button>

              </div>

              {resume.experience.map(
                (experience, index) => (

                  <div
                    key={index}
                    className="space-y-4"
                  >

                    <div className="grid gap-4 md:grid-cols-2">

                      <input
                        className={inputClass}
                        placeholder="Company"
                        value={experience.company}
                        onChange={(e) =>
                          updateArray(
                            "experience",
                            index,
                            "company",
                            e.target.value
                          )
                        }
                      />

                      <input
                        className={inputClass}
                        placeholder="Role"
                        value={experience.role}
                        onChange={(e) =>
                          updateArray(
                            "experience",
                            index,
                            "role",
                            e.target.value
                          )
                        }
                      />

                    </div>

                    <input
                      className={inputClass}
                      placeholder="Duration"
                      value={experience.duration}
                      onChange={(e) =>
                        updateArray(
                          "experience",
                          index,
                          "duration",
                          e.target.value
                        )
                      }
                    />

                    <textarea
                      rows="4"
                      className={inputClass}
                      placeholder="Describe your responsibilities..."
                      value={experience.description}
                      onChange={(e) =>
                        updateArray(
                          "experience",
                          index,
                          "description",
                          e.target.value
                        )
                      }
                    />

                  </div>

                )
              )}

            </section>

          </div>


          {/* =================================================
              RIGHT PREVIEW
          ================================================= */}

          <div className="lg:sticky lg:top-6 lg:h-fit">

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">

              {/* Preview Header */}

              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">

                <div>

                  <p className="text-xs font-bold">
                    Live Preview
                  </p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Your resume updates automatically
                  </p>

                </div>

                <button
                  onClick={() => window.print()}
                  className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-950 hover:bg-slate-200"
                >
                  Download PDF
                </button>

              </div>


              {/* Resume */}

              <div className="bg-slate-100 p-4 md:p-7">

                <div
                  id="resume-preview"
                  className="mx-auto min-h-[900px] max-w-[800px] bg-white p-8 text-slate-900 shadow-2xl md:p-10"
                >

                  {/* NAME */}

                  <h1 className="text-3xl font-bold tracking-tight">
                    {resume.personal.name ||
                      "Your Name"}
                  </h1>

                  <p className="mt-2 text-xs text-slate-500">

                    {[
                      resume.personal.email,
                      resume.personal.phone,
                      resume.personal.location,
                    ]
                      .filter(Boolean)
                      .join("  •  ")}

                  </p>

                  <p className="mt-1 text-xs text-slate-500">

                    {[
                      resume.personal.linkedin,
                      resume.personal.github,
                    ]
                      .filter(Boolean)
                      .join("  •  ")}

                  </p>


                  {/* SUMMARY */}

                  {resume.summary && (
                    <ResumeSection title="SUMMARY">

                      <p className="text-xs leading-5 text-slate-600">
                        {resume.summary}
                      </p>

                    </ResumeSection>
                  )}


                  {/* SKILLS */}

                  {(
                    resume.skills.technical ||
                    resume.skills.tools ||
                    resume.skills.soft
                  ) && (

                    <ResumeSection title="SKILLS">

                      <div className="space-y-1 text-xs">

                        {resume.skills.technical && (
                          <p>
                            <b>Technical:</b>{" "}
                            {resume.skills.technical}
                          </p>
                        )}

                        {resume.skills.tools && (
                          <p>
                            <b>Tools:</b>{" "}
                            {resume.skills.tools}
                          </p>
                        )}

                        {resume.skills.soft && (
                          <p>
                            <b>Soft Skills:</b>{" "}
                            {resume.skills.soft}
                          </p>
                        )}

                      </div>

                    </ResumeSection>
                  )}


                  {/* EDUCATION */}

                  {resume.education.some(
                    (item) =>
                      item.degree ||
                      item.college
                  ) && (

                    <ResumeSection title="EDUCATION">

                      {resume.education.map(
                        (item, index) =>
                          (item.degree ||
                            item.college) && (

                            <div
                              key={index}
                              className="mb-3"
                            >

                              <div className="flex justify-between">

                                <b className="text-sm">
                                  {item.degree}
                                </b>

                                <span className="text-xs text-slate-500">
                                  {item.year}
                                </span>

                              </div>

                              <p className="text-xs text-slate-600">
                                {item.college}
                              </p>

                              {item.cgpa && (
                                <p className="text-xs text-slate-500">
                                  {item.cgpa}
                                </p>
                              )}

                            </div>
                          )
                      )}

                    </ResumeSection>
                  )}


                  {/* EXPERIENCE */}

                  {resume.experience.some(
                    (item) =>
                      item.company ||
                      item.role
                  ) && (

                    <ResumeSection title="EXPERIENCE">

                      {resume.experience.map(
                        (item, index) =>
                          (item.company ||
                            item.role) && (

                            <div
                              key={index}
                              className="mb-4"
                            >

                              <div className="flex justify-between">

                                <b className="text-sm">
                                  {item.role}
                                </b>

                                <span className="text-xs text-slate-500">
                                  {item.duration}
                                </span>

                              </div>

                              <p className="text-xs font-medium text-slate-600">
                                {item.company}
                              </p>

                              <p className="mt-1 whitespace-pre-line text-xs leading-5 text-slate-600">
                                {item.description}
                              </p>

                            </div>
                          )
                      )}

                    </ResumeSection>
                  )}


                  {/* PROJECTS */}

                  {resume.projects.some(
                    (item) =>
                      item.title ||
                      item.description
                  ) && (

                    <ResumeSection title="PROJECTS">

                      {resume.projects.map(
                        (item, index) =>
                          (item.title ||
                            item.description) && (

                            <div
                              key={index}
                              className="mb-4"
                            >

                              <b className="text-sm">
                                {item.title}
                              </b>

                              <p className="mt-1 whitespace-pre-line text-xs leading-5 text-slate-600">
                                {item.description}
                              </p>

                              {item.technologies && (
                                <p className="mt-1 text-[10px] font-medium text-slate-500">
                                  Tech:{" "}
                                  {item.technologies}
                                </p>
                              )}

                            </div>
                          )
                      )}

                    </ResumeSection>
                  )}

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};


/* =================================================
   RESUME SECTION
================================================= */

const ResumeSection = ({
  title,
  children,
}) => {
  return (
    <section className="mt-6">

      <h2 className="border-b border-slate-300 pb-1 text-xs font-bold tracking-widest">
        {title}
      </h2>

      <div className="mt-3">
        {children}
      </div>

    </section>
  );
};

export default ResumeBuilder;