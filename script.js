/* ============================
   Recruiter Protection (Dashboard Only)
============================ */

if (window.location.pathname.includes("dashboard.html")) {
  let recruiter = JSON.parse(localStorage.getItem("recruiter"));
  if (!recruiter) {
    window.location.href = "signup.html";
  }
}

/* ============================
   Load Stored Data
============================ */

let jobs = JSON.parse(localStorage.getItem("jobs")) || [];
let applications = JSON.parse(localStorage.getItem("applications")) || [];

/* ============================
   DASHBOARD LOGIC
============================ */

if (document.getElementById("totalCount")) {
  let total = applications.length;
  let knocked = applications.filter((app) => app.status === "knocked").length;
  let shortlisted = applications.filter(
    (app) => app.status === "shortlisted",
  ).length;

  document.getElementById("totalCount").innerText = total;
  document.getElementById("knockedCount").innerText = knocked;
  document.getElementById("shortlistedCount").innerText = shortlisted;

  let jobList = document.getElementById("jobList");

  jobList.innerHTML = "";

  jobs.forEach((job, index) => {
    let jobApplications = applications.filter((app) => app.jobId == index);
    let applicantCount = jobApplications.length;

    jobList.innerHTML += `
      <tr>
        <td>
          ${job.title}
          ${job.closed ? "<span style='color:red; font-size:12px;'>(Closed)</span>" : ""}
        </td>
        <td>${applicantCount}</td>
        <td>
          <a href="job.html?id=${index}">
            <button ${job.closed ? "disabled" : ""}>View</button>
          </a>
          <button onclick="closeJob(${index})" style="background:#f59e0b; margin-left:6px;">
            Close
          </button>
          <button onclick="deleteJob(${index})" style="background:#ef4444; margin-left:6px;">
            Delete
          </button>
        </td>
      </tr>
    `;
  });
}

/* ============================
   Show Recruiter Name Safely
============================ */

if (document.getElementById("welcomeText")) {
  let recruiter = JSON.parse(localStorage.getItem("recruiter"));
  if (recruiter) {
    document.getElementById("welcomeText").innerText =
      "Welcome, " + recruiter.name;
  }
}

/* ============================
   SAVE JOB
============================ */

function saveJob() {
  let questions = [];

  for (let i = 1; i <= 5; i++) {
    questions.push({
      question: document.getElementById(`q${i}`).value,
      options: [
        document.getElementById(`q${i}a`).value,
        document.getElementById(`q${i}b`).value,
        document.getElementById(`q${i}c`).value,
        document.getElementById(`q${i}d`).value,
      ],
      correct: document.getElementById(`q${i}correct`).value.toUpperCase(),
    });
  }

  let job = {
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    questions: questions,
    closed: false,
  };

  jobs.push(job);
  localStorage.setItem("jobs", JSON.stringify(jobs));

  alert("Job Created Successfully!");
  window.location.href = "dashboard.html";
}

/* ============================
   CANDIDATE PAGE LOGIC
============================ */

if (document.getElementById("jobContainer")) {
  let params = new URLSearchParams(window.location.search);
  let id = params.get("id");

  let job = jobs[id];
  let container = document.getElementById("jobContainer");

  if (!job) {
    container.innerHTML = "<h3>Job not found.</h3>";
  } else if (job.closed) {
    container.innerHTML = "<h3>This job is closed.</h3>";
  } else {
    let questionHTML = "";

    job.questions.forEach((q, index) => {
      questionHTML += `
        <div class="question-box">
          <h3>${q.question}</h3>

          <label class="option">
            <input type="radio" name="q${index}" value="A">
            ${q.options[0]}
          </label>

          <label class="option">
            <input type="radio" name="q${index}" value="B">
            ${q.options[1]}
          </label>

          <label class="option">
            <input type="radio" name="q${index}" value="C">
            ${q.options[2]}
          </label>

          <label class="option">
            <input type="radio" name="q${index}" value="D">
           <span> ${q.options[3]}</span>
          </label>
        </div>
      `;
    });

    container.innerHTML = `
      <h2>${job.title}</h2>
      <p style="margin-bottom:20px; color:#6b7280;">${job.description}</p>
      ${questionHTML}
      <button onclick="checkAnswers(${id})">Check Answers</button>
    `;
  }
}

/* ============================
   CHECK ANSWERS
============================ */

function checkAnswers(id) {
  let job = jobs[id];
  let isShortlisted = true;

  job.questions.forEach((q, index) => {
    let selected = document.querySelector(`input[name="q${index}"]:checked`);
    if (!selected || selected.value !== q.correct) {
      isShortlisted = false;
    }
  });

  if (!isShortlisted) {
    applications.push({ jobId: id, status: "knocked" });
    localStorage.setItem("applications", JSON.stringify(applications));

    alert("You have been screened out.");
    window.location.href = "dashboard.html";
  } else {
    showResumeUpload(id);
  }
}

/* ============================
   SHOW RESUME UPLOAD
============================ */

function showResumeUpload(id) {
  let container = document.getElementById("jobContainer");

  container.innerHTML += `
    <div style="margin-top:20px;">
      <h3>Upload Resume</h3>
      <input type="file" id="resumeFile">
      <button onclick="finalSubmit(${id})">Submit Application</button>
    </div>
  `;
}

/* ============================
   FINAL SUBMIT
============================ */

function finalSubmit(id) {
  applications.push({
    jobId: id,
    status: "shortlisted",
    resumeUploaded: true,
  });

  localStorage.setItem("applications", JSON.stringify(applications));

  alert("Resume submitted successfully!");
  window.location.href = "dashboard.html";
}

/* ============================
   SIGNUP
============================ */

function signup() {
  let name = document.getElementById("name").value;
  let email = document.getElementById("email").value;

  if (!name || !email) {
    alert("Please fill all fields");
    return;
  }

  localStorage.setItem("recruiter", JSON.stringify({ name, email }));
  window.location.href = "dashboard.html";
}

/* ============================
   LOGOUT
============================ */

function logout() {
  localStorage.removeItem("recruiter");
  window.location.href = "index.html";
}

/* ============================
   DELETE JOB
============================ */

function deleteJob(index) {
  if (!confirm("Are you sure you want to delete this job?")) {
    return;
  }

  jobs.splice(index, 1);
  localStorage.setItem("jobs", JSON.stringify(jobs));

  applications = applications.filter((app) => app.jobId != index);
  localStorage.setItem("applications", JSON.stringify(applications));

  alert("Job deleted successfully!");
  window.location.reload();
}

/* ============================
   CLOSE JOB
============================ */

function closeJob(index) {
  jobs[index].closed = true;
  localStorage.setItem("jobs", JSON.stringify(jobs));

  alert("Job closed successfully!");
  window.location.reload();
}
