/* ==========================================================================
   아이약쏙 — main.js
   Vanilla JS. 저장소: localStorage (key: aiyakssok_data)
   화면: home / add / timeline / summary / settings
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * 0. 상수
   * ------------------------------------------------------------------ */
  var STORAGE_KEY = "aiyakssok_data";

  var SYMPTOM_OPTIONS = ["기침", "콧물", "발열", "구토", "설사", "비염", "중이염", "기타"];
  var SEVERITY_OPTIONS = ["약함", "보통", "심함"];
  var CATEGORY_OPTIONS = ["항생제", "해열제", "기침약", "콧물약", "소화기약", "기타"];
  var INTAKE_STATUS_OPTIONS = ["복용중", "완료", "중단"];
  var REASON_OPTIONS = ["증상 호전", "부작용 의심", "증상 악화로 재처방", "의료진 안내 후 보호자 기록", "기타"];
  var REACTION_OPTIONS = ["설사", "구토", "발진", "복통", "식욕저하", "기타"];
  var WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

  var TYPE_META = {
    symptom:        { label: "증상",      color: "var(--symptom)",      colorLight: "var(--symptom-light)",      icon: "symptom" },
    hospital:       { label: "병원 방문",  color: "var(--hospital)",     colorLight: "var(--hospital-light)",     icon: "hospital" },
    prescription:   { label: "처방",      color: "var(--prescription)", colorLight: "var(--prescription-light)", icon: "pill" },
    intake:         { label: "실제 복용",  color: "var(--intake)",       colorLight: "var(--intake-light)",       icon: "calendar" },
    discontinuation:{ label: "중단",      color: "var(--discontinue)",  colorLight: "var(--discontinue-light)",  icon: "stop" },
    reaction:       { label: "반응 기록",  color: "var(--reaction)",     colorLight: "var(--reaction-light)",     icon: "reaction" }
  };

  var SCREEN_TITLES = {
    home: "홈",
    add: "기록 추가",
    timeline: "타임라인",
    summary: "진료 요약",
    settings: "설정"
  };

  // 강화된 의료 안전 문구 (홈/설정/진료요약 공통) 및 복사문구용 축약본
  var SAFETY_NOTICE_FULL = "아이약쏙은 보호자가 아이의 증상, 처방, 실제 복용 이력을 기록하기 위한 도구입니다. 약의 복용, 중단, 변경 여부는 반드시 의사 또는 약사의 지시에 따라 결정해야 합니다. 본 앱은 진단, 처방, 약물 추천, 항생제 필요 여부 판단을 제공하지 않습니다.";
  var SAFETY_NOTICE_SHORT = "이 요약은 보호자가 기록한 정보이며, 진단이나 처방을 대신하지 않습니다. 약의 복용, 중단, 변경은 반드시 의사 또는 약사의 지시에 따라 결정해야 합니다.";

  var ICONS = {
    symptom: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3v9a3 3 0 1 0 6 0V3"/><line x1="7" y1="3" x2="11" y2="3"/><line x1="13" y1="3" x2="17" y2="3"/></svg>',
    hospital: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="1.5"/><line x1="12" y1="8" x2="12" y2="14"/><line x1="9" y1="11" x2="15" y2="11"/></svg>',
    pill: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="9.5" width="17" height="7" rx="3.5" transform="rotate(-45 12 12)"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="16" rx="2"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/><line x1="3.5" y1="10" x2="20.5" y2="10"/><path d="m8.5 15 2 2 4-4"/></svg>',
    stop: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></svg>',
    edit: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="7" x2="20" y2="7"/><path d="M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/><path d="M19 7l-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7"/></svg>',
    chevronRight: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>',
    info: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16"/><circle cx="12" cy="7.6" r="0.6" fill="currentColor" stroke="none"/></svg>',
    plus: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    seedling: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21V11"/><path d="M12 11c0-4 3-6 7-6 0 4-3 7-7 7"/><path d="M12 13c0-3-2.5-5-6-5 0 3.5 2.5 6 6 6"/></svg>',
    box: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8 12 4l8.5 4-8.5 4-8.5-4Z"/><path d="M3.5 8v8L12 20l8.5-4V8"/><path d="M12 12v8"/></svg>',
    sparkle: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/></svg>',
    shield: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5 5 6v6c0 4.2 3 7.4 7 8.5 4-1.1 7-4.3 7-8.5V6l-7-2.5Z"/><path d="m9.2 12 1.9 1.9 3.7-3.9"/></svg>',
    arrowRight: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/></svg>',
    reaction: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21C7 17.5 4 14 4 10a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 1.6-.5 3-1.4 4.4"/><path d="M14 14h5M16.5 11.5v5" opacity="0"/><circle cx="12" cy="10" r="1.2" fill="currentColor" stroke="none"/></svg>',
    copy: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>'
  };

  /* ------------------------------------------------------------------ *
   * 1. 상태
   * ------------------------------------------------------------------ */
  var state = {
    data: null,
    screen: "home",
    addType: "symptom",
    editingId: null,
    editingType: null,
    timelineFilter: "all",
    prefill: null
  };

  /* ------------------------------------------------------------------ *
   * 2. 저장소
   * ------------------------------------------------------------------ */
  function defaultData() {
    return {
      child: { name: "", birthDate: "", weight: "", note: "" },
      records: []
    };
  }

  function loadData() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultData();
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return defaultData();
      if (!parsed.child) parsed.child = { name: "", birthDate: "", weight: "", note: "" };
      // 마이그레이션: 기존 데이터에 weight 필드가 없으면 빈 문자열로 보정
      if (typeof parsed.child.weight === "undefined" || parsed.child.weight === null) parsed.child.weight = "";
      if (!Array.isArray(parsed.records)) parsed.records = [];
      return parsed;
    } catch (e) {
      return defaultData();
    }
  }

  function saveData() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
    } catch (e) {
      toast("저장에 실패했어요. 저장 공간을 확인해 주세요.");
    }
  }

  /* ------------------------------------------------------------------ *
   * 3. 유틸리티
   * ------------------------------------------------------------------ */
  function uid() {
    return "r_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  function pad2(n) { return n < 10 ? "0" + n : "" + n; }

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }

  function parseDate(str) {
    // "YYYY-MM-DD" -> Date (local, noon to avoid TZ edge issues)
    var parts = (str || "").split("-");
    if (parts.length !== 3) return null;
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 12, 0, 0);
  }

  function formatDate(str) {
    var d = parseDate(str);
    if (!d) return "-";
    return (d.getMonth() + 1) + "월 " + d.getDate() + "일 (" + WEEKDAYS[d.getDay()] + ")";
  }

  function formatDateShort(str) {
    var d = parseDate(str);
    if (!d) return "-";
    return (d.getMonth() + 1) + "." + pad2(d.getDate());
  }

  function daysBetween(startStr, endStr) {
    var s = parseDate(startStr);
    var e = parseDate(endStr);
    if (!s || !e) return 0;
    var diff = Math.round((e.getTime() - s.getTime()) / 86400000);
    return diff + 1; // inclusive
  }

  function addDaysStr(dateStr, n) {
    var d = parseDate(dateStr);
    if (!d) return dateStr;
    d.setDate(d.getDate() + n);
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }

  function ageString(birthDate) {
    if (!birthDate) return "";
    var b = parseDate(birthDate);
    if (!b) return "";
    var now = new Date();
    var years = now.getFullYear() - b.getFullYear();
    var months = now.getMonth() - b.getMonth();
    if (now.getDate() < b.getDate()) months -= 1;
    if (months < 0) { years -= 1; months += 12; }
    if (years < 0) return "";
    return "만 " + years + "세 " + months + "개월";
  }

  // 체중 표시 문자열 (참고용). 값이 없으면 빈 문자열 반환. 계산·추천에는 절대 사용하지 않음.
  function weightString(weight) {
    if (weight === null || weight === undefined) return "";
    var w = String(weight).trim();
    if (w === "") return "";
    return w + "kg";
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str).replace(/[&<>"']/g, function (ch) {
      var map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
      return map[ch];
    });
  }

  /* 한글 종성(받침) 유무 판정 — 자연스러운 조사 선택에 사용 (표시 전용) */
  function hasBatchim(str) {
    if (!str) return false;
    var lastChar = String(str).trim().slice(-1);
    var code = lastChar.charCodeAt(0);
    if (code < 0xAC00 || code > 0xD7A3) return false;
    return (code - 0xAC00) % 28 !== 0;
  }
  function josa(word, withBatchim, withoutBatchim) {
    return hasBatchim(word) ? withBatchim : withoutBatchim;
  }

  function statusBadgeClass(status) {
    if (status === "복용중") return "status-ongoing";
    if (status === "완료") return "status-done";
    if (status === "중단") return "status-stopped";
    return "";
  }

  var toastTimer = null;
  function toast(msg) {
    var el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("is-visible");
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      el.classList.remove("is-visible");
    }, 2200);
  }

  /* ------------------------------------------------------------------ *
   * 4. 레코드 헬퍼
   * ------------------------------------------------------------------ */
  function getRecords(type) {
    return state.data.records.filter(function (r) { return r.type === type; });
  }

  function findRecordById(id) {
    for (var i = 0; i < state.data.records.length; i++) {
      if (state.data.records[i].id === id) return state.data.records[i];
    }
    return null;
  }

  function addRecord(rec) {
    rec.id = uid();
    rec.createdAt = Date.now();
    state.data.records.push(rec);
    saveData();
    return rec;
  }

  function updateRecord(id, patch) {
    var rec = findRecordById(id);
    if (!rec) return null;
    for (var k in patch) { if (patch.hasOwnProperty(k)) rec[k] = patch[k]; }
    saveData();
    return rec;
  }

  function deleteRecord(id) {
    state.data.records = state.data.records.filter(function (r) { return r.id !== id; });
    saveData();
  }

  function sortByDateDesc(arr) {
    return arr.slice().sort(function (a, b) {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }

  function sortByDateAsc(arr) {
    return arr.slice().sort(function (a, b) {
      if (a.date !== b.date) return a.date > b.date ? 1 : -1;
      return (a.createdAt || 0) - (b.createdAt || 0);
    });
  }

  function allMedNames() {
    var names = {};
    state.data.records.forEach(function (r) {
      if (r.medName) names[r.medName] = true;
    });
    return Object.keys(names);
  }

  /* 처방 <-> 실제 복용 <-> 중단 매칭 */
  function buildMedicationSummaries() {
    var prescriptions = sortByDateDesc(getRecords("prescription"));
    var intakes = getRecords("intake");
    var discontinuations = getRecords("discontinuation");

    return prescriptions.map(function (p) {
      var pMed = (p.medName || "").trim();
      var candidates = intakes.filter(function (i) { return (i.medName || "").trim() === pMed; });
      var matched = null;
      if (candidates.length) {
        var after = candidates.filter(function (i) { return i.startDate >= p.date; })
          .sort(function (a, b) { return a.startDate < b.startDate ? -1 : 1; });
        if (after.length) {
          matched = after[0];
        } else {
          matched = candidates.slice().sort(function (a, b) { return a.startDate < b.startDate ? 1 : -1; })[0];
        }
      }

      var actualDays = null, ongoing = false;
      if (matched) {
        if (matched.status === "복용중") {
          actualDays = daysBetween(matched.startDate, todayStr());
          ongoing = true;
        } else {
          actualDays = daysBetween(matched.startDate, matched.endDate || matched.startDate);
        }
      }

      var discCandidates = discontinuations.filter(function (d) {
        return (d.medName || "").trim() === pMed && d.date >= p.date;
      });
      var disc = null;
      // 중단 사유는 "이 처방 회차의 실제 복용"이 실제로 중단 상태일 때만 연결한다.
      // (같은 약을 재처방받은 경우, 다른 회차의 중단 사유가 잘못 표시되는 것을 방지)
      if (matched && matched.status === "중단" && discCandidates.length) {
        var targetDate = matched.endDate || matched.startDate;
        discCandidates.sort(function (a, b) {
          return Math.abs(daysBetween(targetDate, a.date)) - Math.abs(daysBetween(targetDate, b.date));
        });
        disc = discCandidates[0];
      }

      return { prescription: p, intake: matched, actualDays: actualDays, ongoing: ongoing, discontinuation: disc };
    });
  }

  /* ------------------------------------------------------------------ *
   * 4-1. 브리핑 / 사건 흐름 생성 (읽기 전용 뷰 로직 — 데이터 구조 변경 없음)
   *      기존 레코드를 바탕으로 자연어 문장과 진료 에피소드를 계산만 한다.
   * ------------------------------------------------------------------ */
  function relativeDaysAgo(dateStr) {
    var diff = daysBetween(dateStr, todayStr()) - 1;
    if (diff <= 0) return "오늘";
    if (diff === 1) return "어제";
    return diff + "일 전";
  }

  function isAntibiotic(p) { return p && p.category === "항생제"; }

  /* 홈 화면용 짧은 브리핑: 지금 상황을 1~3문장으로 요약 */
  function generateHomeBriefing() {
    var child = state.data.child;
    var name = child.name ? child.name : "아이";
    var intakes = getRecords("intake");
    var ongoing = sortByDateDesc(intakes.filter(function (i) { return i.status === "복용중"; }));
    var hospitals = sortByDateDesc(getRecords("hospital"));
    var summaries = buildMedicationSummaries();

    var headline, sub;

    if (ongoing.length > 0) {
      var days = daysBetween(ongoing[0].startDate, todayStr());
      if (ongoing.length === 1) {
        headline = name + josa(name, "은", "는") + " 지금 " + ongoing[0].medName + josa(ongoing[0].medName, "을", "를") + " 복용 중이에요";
        sub = "복용 " + days + "일째예요.";
      } else {
        headline = name + josa(name, "은", "는") + " 지금 약 " + ongoing.length + "가지를 복용 중이에요";
        var medListStr = ongoing.map(function (i) { return i.medName; }).join(", ");
        sub = medListStr + josa(medListStr, "을", "를") + " 복용하고 있어요.";
      }
    } else if (hospitals.length > 0) {
      var lastHospital = hospitals[0];
      headline = relativeDaysAgo(lastHospital.date) + " " + lastHospital.hospitalName + "에서 " + lastHospital.diagnosis + " 진단을 받았어요";
      sub = "지금은 복용 중인 약이 없어요.";
    } else {
      headline = name + "의 복약 기록을 시작해 보세요";
      sub = "병원 방문이나 증상을 기록하면 흐름을 자동으로 정리해 드려요.";
    }

    // 최근 처방 중 처방보다 일찍 중단된 사례가 있으면 한 줄 덧붙임
    var recentStopped = summaries.filter(function (s) {
      return s.discontinuation && !s.ongoing && s.actualDays !== null && s.actualDays < s.prescription.prescribedDays;
    }).sort(function (a, b) { return a.prescription.date < b.prescription.date ? 1 : -1; })[0];
    if (recentStopped && daysBetween(recentStopped.discontinuation.date, todayStr()) <= 14) {
      var stoppedMed = recentStopped.prescription.medName;
      sub += " " + stoppedMed + josa(stoppedMed, "은", "는") + " 처방 " + recentStopped.prescription.prescribedDays + "일 중 " +
        "실제 " + recentStopped.actualDays + "일 복용으로 기록됐어요.";
    }

    return { headline: headline, sub: sub };
  }

  /* 진료 요약용 자동 브리핑: 병원 방문·진단 흐름·복약 이행률을 문단으로 정리 */
  function generateSummaryBriefing() {
    var hospitals = sortByDateAsc(getRecords("hospital"));
    var summaries = buildMedicationSummaries();
    var antibiotics = summaries.filter(function (s) { return isAntibiotic(s.prescription); });

    if (hospitals.length === 0 && summaries.length === 0) return null;

    var parts = [];

    if (hospitals.length > 0) {
      var first = hospitals[0];
      var last = hospitals[hospitals.length - 1];
      var diagnosisChain = hospitals.map(function (h) { return h.diagnosis; }).filter(function (d, i, arr) {
        return i === 0 || arr[i - 1] !== d;
      });
      var rangeText = hospitals.length > 1
        ? formatDateShort(first.date) + " ~ " + formatDateShort(last.date)
        : formatDateShort(first.date);
      parts.push(rangeText + " 사이 병원을 <strong>" + hospitals.length + "회</strong> 방문했어요.");
      if (diagnosisChain.length > 1) {
        parts.push(diagnosisChain.join(" → ") + " 순서로 진단받았어요.");
      } else {
        parts.push("진단명은 <strong>" + diagnosisChain[0] + "</strong>" + josa(diagnosisChain[0], "이었어요", "였어요") + ".");
      }
    }

    if (summaries.length > 0) {
      var finished = summaries.filter(function (s) { return !s.ongoing && s.actualDays !== null; });
      var shortened = finished.filter(function (s) { return s.actualDays < s.prescription.prescribedDays; });
      var onTime = finished.filter(function (s) { return s.actualDays >= s.prescription.prescribedDays; });
      var noRecord = summaries.filter(function (s) { return s.actualDays === null; });

      var complianceText = "처방받은 약 <strong>" + summaries.length + "건</strong> 중 ";
      var bits = [];
      if (onTime.length) bits.push(onTime.length + "건은 처방 기간을 채워 복용");
      if (shortened.length) bits.push('<span class="hl-warn">' + shortened.length + "건은 처방 기간보다 짧게 기록</span>");
      if (noRecord.length) bits.push(noRecord.length + "건은 실제 복용 기록 없음");
      complianceText += bits.length ? bits.join(", ") + "했어요." : "복용 현황이 아직 없어요.";
      parts.push(complianceText);
    }

    if (antibiotics.length > 0) {
      parts.push("이 중 <strong>항생제 처방은 " + antibiotics.length + "건</strong>이었어요.");
    }

    return parts.join(" ");
  }

  /* 타임라인용 진료 에피소드 그룹핑: 병원 방문을 기준으로 사건 흐름 묶기 */
  function buildEpisodes(records) {
    var sorted = sortByDateAsc(records);
    var episodes = [];
    var current = null;

    sorted.forEach(function (r) {
      if (r.type === "hospital") {
        current = { hospital: r, items: [r], startDate: r.date, endDate: r.date };
        episodes.push(current);
        return;
      }
      if (!current) {
        current = { hospital: null, items: [], startDate: r.date, endDate: r.date };
        episodes.push(current);
      }
      current.items.push(r);
      if (r.date > current.endDate) current.endDate = r.date;
      if (r.date < current.startDate) current.startDate = r.date;
    });

    episodes.forEach(function (ep) {
      ep.hasAntibiotic = ep.items.some(function (r) { return r.type === "prescription" && r.category === "항생제"; });
      ep.hasReaction = ep.items.some(function (r) { return r.type === "reaction"; });
      ep.hasAntibioticReaction = ep.hasAntibiotic && ep.hasReaction;
      var intakesInEp = ep.items.filter(function (r) { return r.type === "intake"; });
      var hasOngoing = intakesInEp.some(function (r) { return r.status === "복용중"; });
      var hasStopped = intakesInEp.some(function (r) { return r.status === "중단"; });
      var hasDone = intakesInEp.some(function (r) { return r.status === "완료"; });
      var hasPrescription = ep.items.some(function (r) { return r.type === "prescription"; });
      if (hasOngoing) { ep.statusLabel = "복용중"; ep.statusClass = "status-ongoing"; }
      else if (hasStopped) { ep.statusLabel = "중단"; ep.statusClass = "status-stopped"; }
      else if (hasDone) { ep.statusLabel = "완료"; ep.statusClass = "status-done"; }
      else if (hasPrescription) { ep.statusLabel = "처방됨"; ep.statusClass = ""; }
      else { ep.statusLabel = "경과 관찰"; ep.statusClass = ""; }
    });

    return episodes.reverse(); // 최신 에피소드가 위로
  }

  /* ------------------------------------------------------------------ *
   * 5. 모달 / 화면 전환
   * ------------------------------------------------------------------ */
  function openModal(html) {
    document.getElementById("modalBody").innerHTML =
      '<div class="modal__handle"></div>' + html;
    document.getElementById("modalOverlay").classList.add("is-open");
  }
  function closeModal() {
    document.getElementById("modalOverlay").classList.remove("is-open");
    document.getElementById("modalBody").innerHTML = "";
  }

  function goTo(screen) {
    state.screen = screen;
    state.editingId = null;
    state.editingType = null;
    render();
    document.getElementById("screenRoot").scrollTop = 0;
  }

  /* ------------------------------------------------------------------ *
   * 6. 렌더 디스패치
   * ------------------------------------------------------------------ */
  function render() {
    document.getElementById("screenTitle").textContent = SCREEN_TITLES[state.screen] || "";
    var tabs = document.querySelectorAll(".tab");
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.toggle("is-active", tabs[i].getAttribute("data-screen") === state.screen);
    }
    var child = state.data.child;
    document.getElementById("childBtnLabel").textContent = child.name ? child.name : "아이 정보";

    var root = document.getElementById("screenRoot");
    if (state.screen === "home") { root.innerHTML = renderHome(); bindHome(); }
    else if (state.screen === "add") { root.innerHTML = renderAdd(); bindAdd(); }
    else if (state.screen === "timeline") { root.innerHTML = renderTimeline(); bindTimeline(); }
    else if (state.screen === "summary") { root.innerHTML = renderSummary(); bindSummary(); }
    else if (state.screen === "settings") { root.innerHTML = renderSettings(); bindSettings(); }
  }

  /* ==================================================================== *
   * HOME — "기록 앱"이 아니라 "브리핑 앱"으로
   * ==================================================================== */
  function renderHome() {
    var records = state.data.records;
    var child = state.data.child;

    if (records.length === 0) {
      return (
        '<div class="briefing-card">' +
          '<div class="briefing-card__eyebrow">' + ICONS.sparkle + ' 아이약쏙</div>' +
          '<div class="briefing-card__headline">' + (child.name ? escapeHtml(child.name) + "의 " : "아이의 ") + '복약 흐름을<br>바로 이해할 수 있게 정리해 드려요</div>' +
          '<div class="briefing-card__sub">병원 방문, 처방, 실제 복용 기록을 남기면 처방 기간과 실제로 먹인 기간의 차이를 자동으로 브리핑해 드려요.</div>' +
        '</div>' +
        '<div class="empty">' +
          '<div class="empty__icon">' + ICONS.box + '</div>' +
          '<div class="empty__title">아직 기록이 없어요</div>' +
          '<div class="empty__desc">첫 기록을 추가하거나, 샘플 데이터로<br>먼저 화면을 둘러볼 수 있어요.</div>' +
          '<div class="empty__actions">' +
            '<button type="button" class="btn btn-primary" data-action="go-add">' + ICONS.plus + ' 기록 추가하기</button>' +
            '<button type="button" class="btn btn-ghost" data-action="sample">' + ICONS.seedling + ' 샘플로 둘러보기</button>' +
          '</div>' +
        '</div>' +
        renderFooterNote()
      );
    }

    var summaries = buildMedicationSummaries();
    var antibiotics = summaries.filter(function (s) { return isAntibiotic(s.prescription); }).slice(0, 2);
    var ongoingIntakes = sortByDateDesc(getRecords("intake").filter(function (i) { return i.status === "복용중"; }));
    var recentEvents = sortByDateDesc(records).slice(0, 4);
    var briefing = generateHomeBriefing();

    var html = "";

    // 1) 오늘의 브리핑
    html += '<div class="briefing-card">' +
      '<div class="briefing-card__eyebrow">' + ICONS.sparkle + ' ' + (child.name ? escapeHtml(child.name) : "우리 아이") + (ageString(child.birthDate) ? " · " + ageString(child.birthDate) : "") + '</div>' +
      '<div class="briefing-card__headline">' + escapeHtml(briefing.headline) + '</div>' +
      '<div class="briefing-card__sub">' + escapeHtml(briefing.sub) + '</div>' +
      '<div class="briefing-card__meta">' +
        '<div class="briefing-meta-item"><span class="briefing-meta-item__num">' + getRecords("hospital").length + '</span><span class="briefing-meta-item__label">병원 방문</span></div>' +
        '<div class="briefing-meta-item"><span class="briefing-meta-item__num">' + getRecords("prescription").length + '</span><span class="briefing-meta-item__label">처방</span></div>' +
        '<div class="briefing-meta-item"><span class="briefing-meta-item__num">' + ongoingIntakes.length + '</span><span class="briefing-meta-item__label">복용중</span></div>' +
      '</div>' +
    '</div>';

    // 2) 항생제 스포트라이트 (있을 때만, 별도 강조)
    if (antibiotics.length > 0) {
      html += '<div class="spotlight-card">' +
        '<div class="spotlight-card__label">' + ICONS.shield + ' 항생제 이력</div>' +
        '<div class="spotlight-card__title">최근 항생제 처방 ' + summaries.filter(function (s) { return isAntibiotic(s.prescription); }).length + '건이 있어요</div>' +
        '<div class="spotlight-card__desc">처방 기간과 실제 복용 기간을 진료 요약에서 비교해 보세요.</div>' +
        '<div class="spotlight-list">' + antibiotics.map(function (s) {
          var metaText = s.actualDays === null ? "복용 기록 없음" : (s.ongoing ? "복용 " + s.actualDays + "일째" : "실제 " + s.actualDays + "일 / 처방 " + s.prescription.prescribedDays + "일");
          return '<button type="button" class="spotlight-row" data-action="open-detail" data-id="' + s.prescription.id + '">' +
            '<span class="spotlight-row__name">' + escapeHtml(s.prescription.medName) + '</span>' +
            '<span class="spotlight-row__meta">' + metaText + '</span>' +
          '</button>';
        }).join("") + '</div>' +
      '</div>';
    }

    // 3) 조용한 기록 추가 (기록 입력을 전면에 내세우지 않음)
    html += '<div class="quiet-actions">' +
      quietAction("symptom", "증상") +
      quietAction("hospital", "병원 방문") +
      quietAction("prescription", "처방") +
      quietAction("intake", "실제 복용") +
    '</div>';

    // 4) 현재 복용 중인 약 (진행률 포함)
    html += '<div class="screen-section">' +
      '<div class="screen-section__head"><span class="screen-section__title">현재 복용 중인 약</span></div>';
    if (ongoingIntakes.length === 0) {
      html += '<div class="card u-muted" style="font-size:12.5px;">현재 복용 중으로 등록된 약이 없어요.</div>';
    } else {
      html += '<div class="med-list-card">' + ongoingIntakes.map(function (i) {
        var days = daysBetween(i.startDate, todayStr());
        var matchedSummary = summaries.filter(function (s) { return s.intake && s.intake.id === i.id; })[0];
        var pct = matchedSummary ? Math.min((days / matchedSummary.prescription.prescribedDays) * 100, 100) : null;
        var metaText = matchedSummary
          ? "복용 " + days + "일째 · 처방 " + matchedSummary.prescription.prescribedDays + "일 중"
          : "복용 " + days + "일째 · " + formatDateShort(i.startDate) + "부터";
        return '<button type="button" class="card-tap med-row" data-action="open-detail" data-id="' + i.id + '">' +
          '<span class="med-row__icon" style="background:var(--intake-light);color:var(--intake)">' + ICONS.calendar + '</span>' +
          '<span class="med-row__body">' +
            '<span class="med-row__name">' + escapeHtml(i.medName) + '</span>' +
            '<span class="med-row__meta">' + metaText + '</span>' +
            (pct !== null ? '<span class="med-row__progress"><span class="med-row__progress-fill" style="width:' + pct + '%"></span></span>' : "") +
          '</span>' +
          '<span class="med-row__chevron">' + ICONS.chevronRight + '</span>' +
        '</button>';
      }).join("") + '</div>';
    }
    html += '</div>';

    // 5) 최근 흐름 (기록 목록이 아니라 짧은 이야기로)
    html += '<div class="screen-section">' +
      '<div class="screen-section__head"><span class="screen-section__title">최근 흐름</span>' +
      '<button type="button" class="screen-section__link" data-action="go-timeline">전체 타임라인 ' + ICONS.arrowRight + '</button></div>' +
      '<div class="flow-teaser">' + recentEvents.map(function (r) {
        var meta = TYPE_META[r.type];
        return '<button type="button" class="flow-teaser__item" data-action="open-detail" data-id="' + r.id + '">' +
          '<span class="flow-teaser__dot" style="--dot:' + meta.color + '"></span>' +
          '<span class="flow-teaser__body">' +
            '<span class="flow-teaser__text">' + escapeHtml(narrativeLine(r)) + '</span>' +
            '<span class="flow-teaser__date">' + relativeDaysAgo(r.date) + ' · ' + meta.label + '</span>' +
          '</span>' +
        '</button>';
      }).join("") + '</div>' +
    '</div>';

    html += renderFooterNote();
    return html;
  }

  function quietAction(type, label) {
    var meta = TYPE_META[type];
    return '<button type="button" class="quiet-action" data-action="quick-add" data-type="' + type + '">' +
      '<span class="quiet-action__dot" style="background:' + meta.color + '"></span>' + label +
    '</button>';
  }

  function renderFooterNote() {
    return '<p class="app-footer-note">' + escapeHtml(SAFETY_NOTICE_FULL) + '</p>';
  }

  function bindHome() {
    var root = document.getElementById("screenRoot");
    root.querySelectorAll('[data-action="go-add"]').forEach(function (el) {
      el.addEventListener("click", function () { goTo("add"); });
    });
    root.querySelectorAll('[data-action="go-timeline"]').forEach(function (el) {
      el.addEventListener("click", function () { goTo("timeline"); });
    });
    root.querySelectorAll('[data-action="go-summary"]').forEach(function (el) {
      el.addEventListener("click", function () { goTo("summary"); });
    });
    root.querySelectorAll('[data-action="sample"]').forEach(function (el) {
      el.addEventListener("click", function () { generateSampleData(); });
    });
    root.querySelectorAll('[data-action="quick-add"]').forEach(function (el) {
      el.addEventListener("click", function () {
        state.addType = el.getAttribute("data-type");
        goTo("add");
      });
    });
    root.querySelectorAll('[data-action="open-detail"]').forEach(function (el) {
      el.addEventListener("click", function () { openRecordDetail(el.getAttribute("data-id")); });
    });
  }

  /* ==================================================================== *
   * ADD (기록 추가)
   * ==================================================================== */
  function renderAdd() {
    var editing = state.editingId ? findRecordById(state.editingId) : null;
    var type = editing ? editing.type : state.addType;

    var typeGrid = ["symptom", "hospital", "prescription", "intake", "discontinuation", "reaction"].map(function (t) {
      var meta = TYPE_META[t];
      var active = t === type;
      return '<button type="button" class="type-btn' + (active ? " is-active" : "") + '" data-action="select-type" data-type="' + t + '"' +
        (active ? ' style="--type-color:' + meta.color + ';--type-color-light:' + meta.colorLight + '"' : '') + '>' +
        '<span class="type-btn__icon" style="background:' + meta.colorLight + ';color:' + meta.color + '">' + ICONS[meta.icon] + '</span>' +
        '<span>' + meta.label + '</span></button>';
    }).join("");

    var html = "";
    if (!editing) {
      html += '<div class="chip-row" style="margin-bottom:14px;"></div>';
      html += '<div class="type-grid">' + typeGrid + '</div>';
    } else {
      html += '<div class="card" style="margin-bottom:16px; display:flex; align-items:center; gap:8px;">' +
        '<span class="badge badge-cat">' + TYPE_META[type].label + ' 수정 중</span></div>';
    }

    // 신규 처방은 여러 약을 한 번에 입력하는 전용 폼을 사용한다.
    // (처방 "수정"은 레코드 단위이므로 기존 단일 폼을 그대로 유지 — 타임라인/요약 호환 보존)
    if (type === "prescription" && !editing) {
      html += renderPrescriptionMultiForm();
      return html;
    }

    html += '<form id="recordForm" novalidate>' + renderFormFields(type, editing) + '</form>';
    return html;
  }

  /* ------------------------------------------------------------------ *
   * ADD — 처방 여러 건 입력 (신규 전용)
   * 데이터 구조 변경 없음: 저장 시 약 1건당 prescription 레코드 1개 생성
   * ------------------------------------------------------------------ */
  function prescriptionMedRowHtml(idx, data) {
    data = data || {};
    // 항생제 여부: 불러온 레코드의 category === "항생제" 또는 명시적 isAntibiotic 플래그로 판정
    var isAnti = data.category === "항생제" || data.isAntibiotic === true;
    return '<div class="med-entry" data-med-row>' +
      '<div class="med-entry__head">' +
        '<span class="med-entry__index">약 ' + (idx + 1) + '</span>' +
        '<span class="med-entry__badge">' + (isAnti ? antibioticBadgeHtml() : "") + '</span>' +
        '<button type="button" class="med-entry__remove" data-action="remove-med-row" aria-label="이 약 삭제">' + ICONS.trash + '</button>' +
      '</div>' +
      '<div class="field">' + fieldLabel("약 이름", true) +
        '<input class="input" type="text" name="medName" list="medNameListRx" placeholder="예: 세프클러현탁액" value="' + escapeHtml(data.medName || "") + '"></div>' +
      '<div class="field-row">' +
        '<div class="field">' + fieldLabel("용량", false) +
          '<input class="input" type="text" name="dose" placeholder="예: 7ml, 1포, 0.5정" value="' + escapeHtml(data.dose || "") + '"></div>' +
        '<div class="field med-anti-field">' + fieldLabel("항생제 여부", false) +
          '<label class="med-anti"><input type="checkbox" name="isAntibiotic"' + (isAnti ? " checked" : "") + '><span>항생제예요</span></label></div>' +
      '</div>' +
      '<div class="field-row">' +
        '<div class="field">' + fieldLabel("처방 일수", true) +
          '<input class="input" type="number" name="prescribedDays" min="1" max="60" placeholder="예: 7" value="' + escapeHtml(data.prescribedDays || "") + '"></div>' +
        '<div class="field">' + fieldLabel("하루 복용 횟수", true) +
          '<input class="input" type="number" name="timesPerDay" min="1" max="6" placeholder="예: 3" value="' + escapeHtml(data.timesPerDay || "") + '"></div>' +
      '</div>' +
      '<div class="field u-mt-0">' + fieldLabel("의사 지시 / 메모", false) +
        '<input class="input" type="text" name="doctorInstruction" placeholder="예: 식후 30분" value="' + escapeHtml(data.doctorInstruction || "") + '"></div>' +
    '</div>';
  }

  function antibioticBadgeHtml() {
    return '<span class="badge badge-antibiotic">' + ICONS.shield + ' 항생제</span>';
  }

  function renderPrescriptionMultiForm() {
    var prefill = state.prefill || {};
    var date = prefill.date || todayStr();
    var firstRow = prescriptionMedRowHtml(0, { medName: prefill.medName || "" });
    return '<form id="recordForm" novalidate>' +
      '<div class="field">' + fieldLabel("날짜 (처방일)", true) +
        '<input class="input" type="date" name="date" value="' + date + '" required></div>' +

      // 공통 기본값: 여기 값을 넣으면 빈 약 카드와 새로 추가하는 약에 자동으로 채워짐
      '<div class="rx-defaults">' +
        '<div class="rx-defaults__title">공통 기본값 <span class="rx-defaults__hint">약 카드에 자동으로 채워져요</span></div>' +
        '<div class="field-row">' +
          '<div class="field u-mt-0">' + fieldLabel("기본 처방일수", false) +
            '<input class="input" type="number" name="defDays" min="1" max="60" placeholder="예: 7"></div>' +
          '<div class="field u-mt-0">' + fieldLabel("기본 복용횟수", false) +
            '<input class="input" type="number" name="defTimes" min="1" max="6" placeholder="예: 3"></div>' +
        '</div>' +
        '<div class="field u-mt-0">' + fieldLabel("공통 복용 지시", false) +
          '<input class="input" type="text" name="defInstruction" placeholder="예: 식후 30분"></div>' +
      '</div>' +

      '<div class="rx-toolbar">' +
        '<button type="button" class="btn btn-soft btn-sm" data-action="load-recent-rx">' + ICONS.copy + ' 최근 처방 불러오기</button>' +
      '</div>' +
      '<datalist id="medNameListRx">' + allMedNames().map(function (n) { return '<option value="' + escapeHtml(n) + '">'; }).join("") + '</datalist>' +
      '<div class="med-rows" id="medRows">' + firstRow + '</div>' +
      '<button type="button" class="btn btn-ghost btn-block rx-add-btn" data-action="add-med-row">' + ICONS.plus + ' 약 추가</button>' +
      '<div id="formError" class="form-error" style="display:none;"></div>' +
      '<div class="form-actions"><button type="submit" class="btn btn-primary btn-block">모두 저장</button></div>' +
    '</form>';
  }

  function fieldLabel(text, required) {
    return '<span class="field__label">' + text + (required ? '<span class="required">*</span>' : '') + '</span>';
  }

  function renderFormFields(type, editing) {
    var prefill = state.prefill || {};
    var v = editing || {};
    var html = "";

    if (type === "symptom") {
      var date = v.date || prefill.date || todayStr();
      var isCustomSymptom = v.symptom && SYMPTOM_OPTIONS.indexOf(v.symptom) === -1;
      html +=
        '<div class="field">' + fieldLabel("날짜", true) +
          '<input class="input" type="date" name="date" value="' + date + '" required></div>' +
        '<div class="field">' + fieldLabel("증상", true) +
          '<div class="chip-row" id="symptomChips">' + SYMPTOM_OPTIONS.map(function (s) {
            var sel = (v.symptom === s) || (!v.symptom && false);
            return '<button type="button" class="chip' + (sel ? " is-selected" : "") + '" data-chip-group="symptom" data-value="' + s + '">' + s + '</button>';
          }).join("") + '</div>' +
          '<input class="input" type="text" name="symptomCustom" placeholder="기타 증상을 입력해 주세요"' +
            (isCustomSymptom ? ' value="' + escapeHtml(v.symptom) + '"' : '') +
            ' style="margin-top:8px;display:' + (isCustomSymptom ? "block" : "none") + ';"></div>' +
        '<input type="hidden" name="symptom" value="' + escapeHtml(v.symptom || "") + '">' +
        '<div class="field">' + fieldLabel("심각도", true) +
          '<div class="segmented" id="severitySeg">' + SEVERITY_OPTIONS.map(function (s) {
            var sel = v.severity ? v.severity === s : s === "보통";
            return '<button type="button" class="segmented__btn' + (sel ? " is-selected" : "") + '" data-seg-group="severity" data-value="' + s + '">' + s + '</button>';
          }).join("") + '</div>' +
          '<input type="hidden" name="severity" value="' + (v.severity || "보통") + '"></div>' +
        '<div class="field">' + fieldLabel("메모", false) +
          '<textarea class="textarea" name="memo" placeholder="예: 밤에 기침이 심해짐">' + escapeHtml(v.memo || "") + '</textarea></div>';
    }

    else if (type === "hospital") {
      var hDate = v.date || prefill.date || todayStr();
      html +=
        '<div class="field">' + fieldLabel("날짜", true) +
          '<input class="input" type="date" name="date" value="' + hDate + '" required></div>' +
        '<div class="field">' + fieldLabel("병원명", true) +
          '<input class="input" type="text" name="hospitalName" placeholder="예: oo소아과" value="' + escapeHtml(v.hospitalName || "") + '" required></div>' +
        '<div class="field">' + fieldLabel("진단명", true) +
          '<input class="input" type="text" name="diagnosis" placeholder="예: 급성 기관지염" value="' + escapeHtml(v.diagnosis || "") + '" required></div>' +
        '<div class="field">' + fieldLabel("의사 메모", false) +
          '<textarea class="textarea" name="doctorMemo" placeholder="예: 호전 없으면 3일 후 재방문">' + escapeHtml(v.doctorMemo || "") + '</textarea></div>';
    }

    else if (type === "prescription") {
      var pDate = v.date || prefill.date || todayStr();
      html +=
        '<div class="field">' + fieldLabel("날짜 (처방일)", true) +
          '<input class="input" type="date" name="date" value="' + pDate + '" required></div>' +
        '<div class="field">' + fieldLabel("약 이름", true) +
          '<input class="input" type="text" name="medName" placeholder="예: 세프클러현탁액" value="' + escapeHtml(v.medName || prefill.medName || "") + '" required></div>' +
        '<div class="field">' + fieldLabel("용량", false) +
          '<input class="input" type="text" name="dose" placeholder="예: 7ml, 1포, 0.5정" value="' + escapeHtml(v.dose || "") + '"></div>' +
        '<div class="field">' + fieldLabel("약 분류", true) +
          '<div class="chip-row" id="categoryChips">' + CATEGORY_OPTIONS.map(function (c) {
            var sel = v.category === c;
            return '<button type="button" class="chip chip-sm' + (sel ? " is-selected" : "") + '" data-chip-group="category" data-value="' + c + '">' + c + '</button>';
          }).join("") + '</div>' +
          '<input type="hidden" name="category" value="' + (v.category || "") + '"></div>' +
        '<div class="field-row">' +
          '<div class="field">' + fieldLabel("처방 일수", true) +
            '<input class="input" type="number" name="prescribedDays" min="1" max="60" placeholder="5" value="' + (v.prescribedDays || "") + '" required></div>' +
          '<div class="field">' + fieldLabel("하루 복용 횟수", true) +
            '<input class="input" type="number" name="timesPerDay" min="1" max="6" placeholder="3" value="' + (v.timesPerDay || "") + '" required></div>' +
        '</div>' +
        '<div class="field">' + fieldLabel("의사 지시", false) +
          '<textarea class="textarea" name="doctorInstruction" placeholder="예: 5일 모두 복용 권장">' + escapeHtml(v.doctorInstruction || "") + '</textarea></div>';
    }

    else if (type === "intake") {
      var status = v.status || "복용중";
      html +=
        '<div class="field">' + fieldLabel("약 이름", true) +
          '<input class="input" type="text" name="medName" list="medNameList" placeholder="예: 세프클러현탁액" value="' + escapeHtml(v.medName || prefill.medName || "") + '" required></div>' +
        '<datalist id="medNameList">' + allMedNames().map(function (n) { return '<option value="' + escapeHtml(n) + '">'; }).join("") + '</datalist>' +
        '<div class="field-row">' +
          '<div class="field">' + fieldLabel("실제 복용 시작일", true) +
            '<input class="input" type="date" name="startDate" value="' + (v.startDate || todayStr()) + '" required></div>' +
          '<div class="field" id="endDateField" style="display:' + (status === "복용중" ? "none" : "block") + ';">' + fieldLabel("실제 복용 종료일", false) +
            '<input class="input" type="date" name="endDate" value="' + (v.endDate || todayStr()) + '"></div>' +
        '</div>' +
        '<div class="field">' + fieldLabel("상태", true) +
          '<div class="segmented" id="statusSeg">' + INTAKE_STATUS_OPTIONS.map(function (s) {
            return '<button type="button" class="segmented__btn' + (status === s ? " is-selected" : "") + '" data-seg-group="status" data-value="' + s + '">' + s + '</button>';
          }).join("") + '</div>' +
          '<input type="hidden" name="status" value="' + status + '">' +
          '<p class="field__hint">복용 중으로 두면 종료일 없이 진행 중으로 기록돼요.</p></div>';
    }

    else if (type === "discontinuation") {
      var dDate = v.date || todayStr();
      var isCustomReason = v.reason && REASON_OPTIONS.indexOf(v.reason) === -1;
      html +=
        '<div class="field">' + fieldLabel("약 이름", true) +
          '<input class="input" type="text" name="medName" list="medNameList2" placeholder="예: 세프클러현탁액" value="' + escapeHtml(v.medName || prefill.medName || "") + '" required></div>' +
        '<datalist id="medNameList2">' + allMedNames().map(function (n) { return '<option value="' + escapeHtml(n) + '">'; }).join("") + '</datalist>' +
        '<div class="field">' + fieldLabel("중단일", true) +
          '<input class="input" type="date" name="date" value="' + dDate + '" required></div>' +
        '<div class="field">' + fieldLabel("중단 사유", true) +
          '<div class="chip-row" id="reasonChips">' + REASON_OPTIONS.map(function (r) {
            var sel = v.reason === r;
            return '<button type="button" class="chip chip-sm' + (sel ? " is-selected" : "") + '" data-chip-group="reason" data-value="' + r + '">' + r + '</button>';
          }).join("") + '</div>' +
          '<input class="input" type="text" name="reasonCustom" placeholder="기타 사유를 입력해 주세요"' +
            (isCustomReason ? ' value="' + escapeHtml(v.reason) + '"' : '') +
            ' style="display:' + (isCustomReason ? "block" : "none") + ';margin-top:8px;">' +
          '<input type="hidden" name="reason" value="' + escapeHtml(v.reason || "") + '"></div>' +
        '<div class="field">' + fieldLabel("특이 반응", false) +
          '<textarea class="textarea" name="reaction" placeholder="예: 특별한 반응 없음">' + escapeHtml(v.reaction || "") + '</textarea></div>';
    }

    else if (type === "reaction") {
      var rDate = v.date || prefill.date || todayStr();
      var isCustomReaction = v.reactionType && REACTION_OPTIONS.indexOf(v.reactionType) === -1;
      html +=
        '<div class="field">' + fieldLabel("날짜", true) +
          '<input class="input" type="date" name="date" value="' + rDate + '" required></div>' +
        '<div class="field">' + fieldLabel("관련 약 이름", false) +
          '<input class="input" type="text" name="medName" list="medNameListReaction" placeholder="예: 세프클러현탁액 (선택)" value="' + escapeHtml(v.medName || prefill.medName || "") + '"></div>' +
        '<datalist id="medNameListReaction">' + allMedNames().map(function (n) { return '<option value="' + escapeHtml(n) + '">'; }).join("") + '</datalist>' +
        '<div class="field">' + fieldLabel("반응 유형", true) +
          '<div class="chip-row" id="reactionTypeChips">' + REACTION_OPTIONS.map(function (rt) {
            var sel = v.reactionType === rt;
            return '<button type="button" class="chip chip-sm' + (sel ? " is-selected" : "") + '" data-chip-group="reactionType" data-value="' + rt + '">' + rt + '</button>';
          }).join("") + '</div>' +
          '<input class="input" type="text" name="reactionTypeCustom" placeholder="기타 반응을 입력해 주세요"' +
            (isCustomReaction ? ' value="' + escapeHtml(v.reactionType) + '"' : '') +
            ' style="margin-top:8px;display:' + (isCustomReaction ? "block" : "none") + ';">' +
          '<input type="hidden" name="reactionType" value="' + escapeHtml(v.reactionType || "") + '"></div>' +
        '<div class="field">' + fieldLabel("심각도", true) +
          '<div class="segmented" id="reactionSeveritySeg">' + SEVERITY_OPTIONS.map(function (s) {
            var sel = v.severity ? v.severity === s : s === "보통";
            return '<button type="button" class="segmented__btn' + (sel ? " is-selected" : "") + '" data-seg-group="severity" data-value="' + s + '">' + s + '</button>';
          }).join("") + '</div>' +
          '<input type="hidden" name="severity" value="' + (v.severity || "보통") + '"></div>' +
        '<div class="field">' + fieldLabel("메모", false) +
          '<textarea class="textarea" name="memo" placeholder="예: 묽은 변 1회">' + escapeHtml(v.memo || "") + '</textarea></div>';
    }

    html += '<div id="formError" class="form-error" style="display:none;"></div>';
    html += '<div class="form-actions">' +
      '<button type="submit" class="btn btn-primary btn-block">' + (editing ? "수정 저장" : "저장") + '</button>' +
    '</div>';
    return html;
  }

  function bindAdd() {
    var root = document.getElementById("screenRoot");

    root.querySelectorAll('[data-action="select-type"]').forEach(function (el) {
      el.addEventListener("click", function () {
        state.addType = el.getAttribute("data-type");
        state.prefill = null;
        render();
      });
    });

    // 신규 처방(여러 약) 전용 폼이면 별도 바인딩만 하고 종료
    var editingNow = state.editingId ? findRecordById(state.editingId) : null;
    var typeNow = editingNow ? editingNow.type : state.addType;
    if (typeNow === "prescription" && !editingNow) {
      bindPrescriptionMulti(root);
      return;
    }

    // chip groups (single-select, with optional custom text reveal)
    root.querySelectorAll("[data-chip-group]").forEach(function (el) {
      el.addEventListener("click", function () {
        var group = el.getAttribute("data-chip-group");
        var value = el.getAttribute("data-value");
        var container = el.parentElement;
        container.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("is-selected"); });
        el.classList.add("is-selected");
        var hidden = root.querySelector('input[type="hidden"][name="' + group + '"]');
        var customInput = null;
        if (group === "symptom") customInput = root.querySelector('input[name="symptomCustom"]');
        if (group === "reason") customInput = root.querySelector('input[name="reasonCustom"]');
        if (group === "reactionType") customInput = root.querySelector('input[name="reactionTypeCustom"]');

        if (value === "기타") {
          if (hidden) hidden.value = customInput ? customInput.value : "기타";
          if (customInput) { customInput.style.display = "block"; customInput.focus(); }
        } else {
          if (hidden) hidden.value = value;
          if (customInput) { customInput.style.display = "none"; customInput.value = ""; }
        }
      });
    });

    root.querySelectorAll('input[name="symptomCustom"], input[name="reasonCustom"], input[name="reactionTypeCustom"]').forEach(function (el) {
      el.addEventListener("input", function () {
        var group = el.name === "symptomCustom" ? "symptom" : (el.name === "reasonCustom" ? "reason" : "reactionType");
        var hidden = root.querySelector('input[type="hidden"][name="' + group + '"]');
        if (hidden) hidden.value = el.value;
      });
    });

    // segmented groups (single-select)
    root.querySelectorAll("[data-seg-group]").forEach(function (el) {
      el.addEventListener("click", function () {
        var group = el.getAttribute("data-seg-group");
        var value = el.getAttribute("data-value");
        var container = el.parentElement;
        container.querySelectorAll(".segmented__btn").forEach(function (c) { c.classList.remove("is-selected"); });
        el.classList.add("is-selected");
        var hidden = root.querySelector('input[type="hidden"][name="' + group + '"]');
        if (hidden) hidden.value = value;
        if (group === "status") {
          var endField = document.getElementById("endDateField");
          if (endField) endField.style.display = value === "복용중" ? "none" : "block";
        }
      });
    });

    var form = document.getElementById("recordForm");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        handleFormSubmit(form);
      });
    }
  }

  /* ------------------------------------------------------------------ *
   * ADD — 처방 멀티폼 바인딩 / 행 관리 / 최근 처방 불러오기
   * ------------------------------------------------------------------ */
  // 한 약 카드(행)의 항생제 체크박스 / 삭제 버튼을 직접 바인딩한다.
  function bindMedRow(rowEl) {
    // 항생제 체크박스: 체크 상태에 따라 상단 배지를 동기화한다.
    var chk = rowEl.querySelector('input[name="isAntibiotic"]');
    if (chk) {
      chk.addEventListener("change", function () {
        var badge = rowEl.querySelector(".med-entry__badge");
        if (badge) badge.innerHTML = chk.checked ? antibioticBadgeHtml() : "";
      });
    }
    // 삭제 버튼
    var rm = rowEl.querySelector('[data-action="remove-med-row"]');
    if (rm) {
      rm.addEventListener("click", function () {
        var container = document.getElementById("medRows");
        if (!container) return;
        var rows = container.querySelectorAll("[data-med-row]");
        if (rows.length <= 1) { toast("최소 한 가지 약은 필요해요."); return; }
        rowEl.parentNode.removeChild(rowEl);
        renumberMedRows(container);
      });
    }
  }

  // 공통 기본값 입력값을 읽어온다 (처방일수 / 복용횟수 / 복용 지시)
  function readRxDefaults(root) {
    function val(name) { var el = root.querySelector('[name="' + name + '"]'); return el ? (el.value || "").trim() : ""; }
    return {
      prescribedDays: val("defDays"),
      timesPerDay: val("defTimes"),
      doctorInstruction: val("defInstruction")
    };
  }

  function bindPrescriptionMulti(root) {
    var container = root.querySelector("#medRows");
    if (!container) return;

    // 초기 렌더된 각 행을 직접 바인딩
    container.querySelectorAll("[data-med-row]").forEach(bindMedRow);

    // 공통 기본값 → 아직 비어 있는 약 카드 필드에 자동 전파 (이미 입력한 값은 덮어쓰지 않음)
    var defMap = { defDays: "prescribedDays", defTimes: "timesPerDay", defInstruction: "doctorInstruction" };
    Object.keys(defMap).forEach(function (defName) {
      var el = root.querySelector('[name="' + defName + '"]');
      if (!el) return;
      el.addEventListener("input", function () {
        var target = defMap[defName];
        container.querySelectorAll("[data-med-row]").forEach(function (row) {
          var f = row.querySelector('[name="' + target + '"]');
          if (f && (f.value || "").trim() === "") f.value = el.value;
        });
      });
    });

    var addBtn = root.querySelector('[data-action="add-med-row"]');
    if (addBtn) {
      addBtn.addEventListener("click", function () {
        var count = container.querySelectorAll("[data-med-row]").length;
        var d = readRxDefaults(root);
        container.insertAdjacentHTML("beforeend", prescriptionMedRowHtml(count, {
          prescribedDays: d.prescribedDays,
          timesPerDay: d.timesPerDay,
          doctorInstruction: d.doctorInstruction
        }));
        var newRow = container.querySelector("[data-med-row]:last-child");
        if (newRow) bindMedRow(newRow);
        renumberMedRows(container);
        var last = newRow ? newRow.querySelector('input[name="medName"]') : null;
        if (last) last.focus();
      });
    }

    var loadBtn = root.querySelector('[data-action="load-recent-rx"]');
    if (loadBtn) loadBtn.addEventListener("click", openRecentPrescriptionsPicker);

    var form = root.querySelector("#recordForm");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        handlePrescriptionMultiSubmit(form);
      });
    }

    renumberMedRows(container);
  }

  // 행 번호 갱신 + 행이 하나뿐이면 삭제 버튼 숨김
  function renumberMedRows(container) {
    var rows = container.querySelectorAll("[data-med-row]");
    rows.forEach(function (row, i) {
      var idx = row.querySelector(".med-entry__index");
      if (idx) idx.textContent = "약 " + (i + 1);
      var rm = row.querySelector(".med-entry__remove");
      if (rm) rm.style.display = rows.length <= 1 ? "none" : "";
    });
  }

  // 불러온(또는 초기화할) 약 목록으로 행 전체를 다시 그림
  function loadPrescriptionRows(list) {
    var container = document.getElementById("medRows");
    if (!container) return;
    if (!list || !list.length) list = [{}];
    container.innerHTML = list.map(function (d, i) { return prescriptionMedRowHtml(i, d); }).join("");
    container.querySelectorAll("[data-med-row]").forEach(bindMedRow);
    renumberMedRows(container);
  }

  function openRecentPrescriptionsPicker() {
    var rx = sortByDateDesc(getRecords("prescription"));
    if (rx.length === 0) { toast("불러올 처방 기록이 없어요."); return; }

    // 같은 날짜에 처방된 약들을 한 회차(그룹)로 묶는다
    var groups = [];
    var byDate = {};
    rx.forEach(function (r) {
      if (!byDate[r.date]) { byDate[r.date] = { date: r.date, items: [] }; groups.push(byDate[r.date]); }
      byDate[r.date].items.push(r);
    });
    groups = groups.slice(0, 8);

    var html = '<div class="modal__head"><span class="modal__title">최근 처방 불러오기</span>' +
      '<button type="button" class="modal__close" data-action="close-modal">' + ICONS.close + '</button></div>' +
      '<p class="modal__hint">불러온 뒤 약을 수정·삭제·추가할 수 있어요. 처방일은 지금 입력한 날짜로 저장돼요.</p>' +
      '<div class="rx-recent-list">' + groups.map(function (g, gi) {
        return '<button type="button" class="rx-recent-card" data-action="load-rx-group" data-idx="' + gi + '">' +
          '<span class="rx-recent-card__date">' + formatDate(g.date) + ' · 약 ' + g.items.length + '가지</span>' +
          '<span class="rx-recent-card__meds">' + g.items.map(function (it) {
            var doseTag = it.dose ? ' <span class="rx-recent-dose">' + escapeHtml(it.dose) + '</span>' : "";
            var badge = it.category === "항생제" ? ' <span class="badge badge-antibiotic">항생제</span>' : "";
            return '<span class="rx-recent-med">' + escapeHtml(it.medName) + doseTag + badge + '</span>';
          }).join("") + '</span>' +
        '</button>';
      }).join("") + '</div>';

    openModal(html);

    var modal = document.getElementById("modalBody");
    modal.querySelectorAll('[data-action="close-modal"]').forEach(function (el) {
      el.addEventListener("click", closeModal);
    });
    modal.querySelectorAll('[data-action="load-rx-group"]').forEach(function (el) {
      el.addEventListener("click", function () {
        var g = groups[parseInt(el.getAttribute("data-idx"), 10)];
        if (!g) return;
        loadPrescriptionRows(g.items.map(function (it) {
          return {
            medName: it.medName,
            dose: it.dose,
            category: it.category, // 항생제 체크박스 상태를 결정
            prescribedDays: it.prescribedDays,
            timesPerDay: it.timesPerDay,
            doctorInstruction: it.doctorInstruction
          };
        }));
        closeModal();
        toast(g.items.length + "가지 약을 불러왔어요. 확인 후 저장해 주세요.");
      });
    });
  }

  function handlePrescriptionMultiSubmit(form) {
    var errEl = document.getElementById("formError");
    if (errEl) errEl.style.display = "none";

    var date = getFormValue(form, "date");
    if (!date) return showFormError("처방일을 입력해 주세요.");

    function rowVal(row, name) {
      var el = row.querySelector('[name="' + name + '"]');
      return el ? (el.value || "").trim() : "";
    }
    function rowChecked(row, name) {
      var el = row.querySelector('[name="' + name + '"]');
      return !!(el && el.checked);
    }

    var rows = form.querySelectorAll("[data-med-row]");
    var records = [];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var medName = rowVal(row, "medName");
      var dose = rowVal(row, "dose");
      var isAnti = rowChecked(row, "isAntibiotic");
      var pdRaw = rowVal(row, "prescribedDays");
      var tpdRaw = rowVal(row, "timesPerDay");
      var instr = rowVal(row, "doctorInstruction");
      var pd = parseInt(pdRaw, 10);
      var tpd = parseInt(tpdRaw, 10);

      // 완전히 빈 행은 건너뛴다
      if (!medName && !dose && !pdRaw && !tpdRaw && !instr && !isAnti) continue;

      // 필수 검증: 약명 / 처방일수 / 하루 복용횟수 (분류·용량은 선택)
      var label = "약 " + (i + 1) + ": ";
      if (!medName) return showFormError(label + "약 이름을 입력해 주세요.");
      if (!pd || pd < 1) return showFormError(label + "처방 일수를 입력해 주세요.");
      if (!tpd || tpd < 1) return showFormError(label + "하루 복용 횟수를 입력해 주세요.");

      var rec = {
        type: "prescription",
        date: date,
        medName: medName,
        // 항생제면 "항생제", 아니면 기존 화면이 깨지지 않도록 안전한 "기타"로 저장
        category: isAnti ? "항생제" : "기타",
        prescribedDays: pd,
        timesPerDay: tpd,
        doctorInstruction: instr
      };
      if (dose) rec.dose = dose; // 용량은 있을 때만 저장 (기존 구조 최대 유지)
      records.push(rec);
    }

    if (records.length === 0) return showFormError("약을 한 가지 이상 입력해 주세요.");

    records.forEach(function (rec) { addRecord(rec); });
    state.prefill = null;
    toast(records.length + "건의 처방이 저장되었어요.");
    goTo("home");
  }

  function getFormValue(form, name) {
    var el = form.elements[name];
    if (!el) return "";
    return (el.value || "").trim();
  }

  function showFormError(msg) {
    var el = document.getElementById("formError");
    if (!el) return;
    el.textContent = msg;
    el.style.display = "block";
  }

  function handleFormSubmit(form) {
    var editing = state.editingId ? findRecordById(state.editingId) : null;
    var type = editing ? editing.type : state.addType;
    var el = document.getElementById("formError");
    if (el) el.style.display = "none";

    var record = { type: type };

    if (type === "symptom") {
      record.date = getFormValue(form, "date");
      record.symptom = getFormValue(form, "symptom");
      record.severity = getFormValue(form, "severity") || "보통";
      record.memo = getFormValue(form, "memo");
      if (!record.date || !record.symptom) return showFormError("날짜와 증상을 입력해 주세요.");
    }
    else if (type === "hospital") {
      record.date = getFormValue(form, "date");
      record.hospitalName = getFormValue(form, "hospitalName");
      record.diagnosis = getFormValue(form, "diagnosis");
      record.doctorMemo = getFormValue(form, "doctorMemo");
      if (!record.date || !record.hospitalName || !record.diagnosis) return showFormError("날짜, 병원명, 진단명을 입력해 주세요.");
    }
    else if (type === "prescription") {
      record.date = getFormValue(form, "date");
      record.medName = getFormValue(form, "medName");
      record.dose = getFormValue(form, "dose");
      record.category = getFormValue(form, "category");
      record.prescribedDays = parseInt(getFormValue(form, "prescribedDays"), 10);
      record.timesPerDay = parseInt(getFormValue(form, "timesPerDay"), 10);
      record.doctorInstruction = getFormValue(form, "doctorInstruction");
      if (!record.date || !record.medName || !record.category) return showFormError("날짜, 약 이름, 약 분류를 입력해 주세요.");
      if (!record.prescribedDays || record.prescribedDays < 1) return showFormError("처방 일수를 올바르게 입력해 주세요.");
      if (!record.timesPerDay || record.timesPerDay < 1) return showFormError("하루 복용 횟수를 올바르게 입력해 주세요.");
    }
    else if (type === "intake") {
      record.medName = getFormValue(form, "medName");
      record.startDate = getFormValue(form, "startDate");
      record.status = getFormValue(form, "status") || "복용중";
      record.endDate = record.status === "복용중" ? "" : (getFormValue(form, "endDate") || todayStr());
      record.date = record.startDate;
      if (!record.medName || !record.startDate) return showFormError("약 이름과 실제 복용 시작일을 입력해 주세요.");
      if (record.endDate && record.endDate < record.startDate) return showFormError("종료일은 시작일 이후여야 해요.");
    }
    else if (type === "discontinuation") {
      record.date = getFormValue(form, "date");
      record.medName = getFormValue(form, "medName");
      record.reason = getFormValue(form, "reason");
      record.reaction = getFormValue(form, "reaction");
      if (!record.date || !record.medName || !record.reason) return showFormError("중단일, 약 이름, 중단 사유를 입력해 주세요.");
    }
    else if (type === "reaction") {
      record.date = getFormValue(form, "date");
      record.medName = getFormValue(form, "medName");
      record.reactionType = getFormValue(form, "reactionType");
      record.severity = getFormValue(form, "severity") || "보통";
      record.memo = getFormValue(form, "memo");
      if (!record.date || !record.reactionType) return showFormError("날짜와 반응 유형을 입력해 주세요.");
    }

    if (editing) {
      updateRecord(editing.id, record);
      toast(TYPE_META[type].label + " 기록이 수정되었어요.");
    } else {
      addRecord(record);
      toast(TYPE_META[type].label + " 기록이 저장되었어요.");
    }

    state.editingId = null;
    state.editingType = null;
    state.prefill = null;
    goTo(editing ? "timeline" : "home");
  }

  /* ==================================================================== *
   * TIMELINE
   * ==================================================================== */
  function summaryLine(r) {
    if (r.type === "symptom") return r.symptom + (r.severity ? " · " + r.severity : "");
    if (r.type === "hospital") return r.hospitalName + " · " + r.diagnosis;
    if (r.type === "prescription") return r.medName + " 처방 · " + r.prescribedDays + "일치";
    if (r.type === "intake") return r.medName + " 복용 " + r.status;
    if (r.type === "discontinuation") return r.medName + " 중단";
    if (r.type === "reaction") return (r.reactionType || "반응") + (r.severity ? " · " + r.severity : "");
    return "";
  }

  function descLine(r) {
    if (r.type === "symptom") return r.memo || "";
    if (r.type === "hospital") return r.doctorMemo || "";
    if (r.type === "prescription") return "하루 " + r.timesPerDay + "회" + (r.doctorInstruction ? " · " + r.doctorInstruction : "");
    if (r.type === "intake") return formatDateShort(r.startDate) + (r.endDate ? " ~ " + formatDateShort(r.endDate) : " ~ 진행중");
    if (r.type === "discontinuation") return r.reason + (r.reaction ? " · " + r.reaction : "");
    if (r.type === "reaction") return (r.medName ? r.medName + " · " : "") + (r.memo || "");
    return "";
  }

  /* 홈 화면 "최근 흐름"에 쓰는 이야기체 한 줄 요약 (표시 전용, 데이터 변경 없음) */
  function narrativeLine(r) {
    if (r.type === "symptom") return r.symptom + josa(r.symptom, "이", "가") + " 나타났어요" + (r.severity === "심함" ? " (심함)" : "");
    if (r.type === "hospital") return r.hospitalName + "에서 " + r.diagnosis + " 진단을 받았어요";
    if (r.type === "prescription") return r.medName + josa(r.medName, "을", "를") + " " + r.prescribedDays + "일치 처방받았어요";
    if (r.type === "intake") {
      if (r.status === "복용중") return r.medName + " 복용을 시작했어요";
      if (r.status === "완료") return r.medName + " 복용을 마쳤어요";
      return r.medName + " 복용을 중단했어요";
    }
    if (r.type === "discontinuation") return r.medName + " 복용을 중단했어요 (" + r.reason + ")";
    if (r.type === "reaction") return (r.reactionType || "반응") + " 반응이 기록되었어요" + (r.medName ? " (" + r.medName + " 복용 중)" : "");
    return "";
  }

  function renderTimeline() {
    var filters = [
      { key: "all", label: "전체" },
      { key: "symptom", label: "증상" },
      { key: "hospital", label: "병원" },
      { key: "prescription", label: "처방" },
      { key: "intake", label: "복용" },
      { key: "discontinuation", label: "중단" },
      { key: "reaction", label: "반응" }
    ];

    var html = '<div class="filter-scroll">' + filters.map(function (f) {
      var active = state.timelineFilter === f.key;
      var dotColor = f.key === "all" ? "var(--text-faint)" : TYPE_META[f.key].color;
      return '<button type="button" class="filter-chip' + (active ? " is-active" : "") + '" data-filter="' + f.key + '">' +
        '<span class="filter-chip__dot" style="background:' + (active ? "#fff" : dotColor) + '"></span>' + f.label + '</button>';
    }).join("") + '</div>';

    var records = state.data.records;
    if (state.timelineFilter !== "all") {
      records = records.filter(function (r) { return r.type === state.timelineFilter; });
    }

    if (records.length === 0) {
      html += '<div class="empty">' +
        '<div class="empty__icon">' + ICONS.calendar + '</div>' +
        '<div class="empty__title">아직 기록이 없어요</div>' +
        '<div class="empty__desc">첫 기록을 시작해 볼까요?</div>' +
        '<div class="empty__actions"><button type="button" class="btn btn-primary" data-action="go-add">' + ICONS.plus + ' 기록 추가하기</button></div>' +
      '</div>';
      return html;
    }

    if (state.timelineFilter === "all") {
      // 병원 방문을 기준으로 사건 흐름(에피소드)을 묶어서 보여준다
      var episodes = buildEpisodes(records);
      html += episodes.map(function (ep) { return episodeHtml(ep); }).join('<div class="timeline-divider"></div>');
    } else {
      // 특정 유형만 볼 때는 날짜순 단순 목록으로 보여준다
      var sorted = sortByDateDesc(records);
      html += '<div class="episode-flow">' + sorted.map(function (r) { return episodeItemHtml(r); }).join("") + '</div>';
    }

    return html;
  }

  function episodeHtml(ep) {
    var dateLabel = ep.startDate === ep.endDate ? formatDate(ep.startDate) : formatDateShort(ep.startDate) + " ~ " + formatDateShort(ep.endDate);
    var title = ep.hospital ? ep.hospital.diagnosis : "병원 방문 전 기록";
    var subtitle = ep.hospital ? ep.hospital.hospitalName : "";
    var itemsAsc = sortByDateAsc(ep.items);

    return '<div class="episode' + (ep.hasAntibiotic ? " is-antibiotic" : "") + '">' +
      '<div class="episode__header">' +
        '<div class="episode__badge-row">' +
          '<span class="episode__status-tag badge-status ' + ep.statusClass + '">' + ep.statusLabel + '</span>' +
          (ep.hasAntibiotic ? '<span class="badge badge-antibiotic">' + ICONS.shield + ' 항생제</span>' : "") +
          (ep.hasAntibioticReaction ? '<span class="badge badge-reaction">항생제 복용 중 반응</span>' : "") +
        '</div>' +
        '<div class="episode__title">' + escapeHtml(title) + (subtitle ? ' · ' + escapeHtml(subtitle) : '') + '</div>' +
        '<div class="episode__meta">' + dateLabel + '</div>' +
      '</div>' +
      '<div class="episode-flow">' + itemsAsc.map(function (r) { return episodeItemHtml(r); }).join("") + '</div>' +
    '</div>';
  }

  function episodeItemHtml(r) {
    var meta = TYPE_META[r.type];
    var isAnti = (r.type === "prescription" && r.category === "항생제");
    var desc = descLine(r);
    return '<div class="episode-item" style="--dot:' + meta.color + ';">' +
      '<button type="button" class="episode-item__card" data-action="open-detail" data-id="' + r.id + '" style="--dot:' + meta.color + ';--dot-light:' + meta.colorLight + '">' +
        '<span class="episode-item__icon">' + ICONS[meta.icon] + '</span>' +
        '<span class="episode-item__body">' +
          '<span class="episode-item__top">' +
            '<span class="episode-item__type">' + meta.label + '</span>' +
            (isAnti ? '<span class="badge badge-antibiotic">항생제</span>' : "") +
            (r.type === "intake" ? '<span class="badge badge-status ' + statusBadgeClass(r.status) + '">' + r.status + '</span>' : "") +
            (r.type === "reaction" ? '<span class="badge badge-reaction">' + escapeHtml(r.reactionType || "반응") + '</span>' : "") +
          '</span>' +
          '<span class="episode-item__title">' + escapeHtml(narrativeLine(r)) + '</span>' +
          (desc ? '<span class="episode-item__desc">' + escapeHtml(desc) + '</span>' : "") +
          '<span class="episode-item__time">' + formatDateShort(r.date) + '</span>' +
        '</span>' +
      '</button>' +
    '</div>';
  }

  function bindTimeline() {
    var root = document.getElementById("screenRoot");
    root.querySelectorAll("[data-filter]").forEach(function (el) {
      el.addEventListener("click", function () {
        state.timelineFilter = el.getAttribute("data-filter");
        render();
      });
    });
    root.querySelectorAll('[data-action="open-detail"]').forEach(function (el) {
      el.addEventListener("click", function () { openRecordDetail(el.getAttribute("data-id")); });
    });
    root.querySelectorAll('[data-action="go-add"]').forEach(function (el) {
      el.addEventListener("click", function () { goTo("add"); });
    });
  }

  /* ==================================================================== *
   * SUMMARY (진료 요약) — 핵심 화면
   * ==================================================================== */
  function compareBarHtml(prescribedDays, actualDays, ongoing) {
    if (actualDays === null || actualDays === undefined) {
      return '<div class="compare-empty">아직 실제 복용 기록이 없어요.</div>';
    }
    var max = Math.max(prescribedDays || 1, actualDays || 1, 1);
    var prescribedPct = Math.max((prescribedDays / max) * 100, 6);
    var actualPct = Math.max((actualDays / max) * 100, 6);
    var diff = actualDays - prescribedDays;
    var deltaHtml;
    if (ongoing) {
      deltaHtml = '<span class="delta delta--ongoing">복용 ' + actualDays + '일째 · 진행 중</span>';
    } else if (diff === 0) {
      deltaHtml = '<span class="delta delta--neutral">처방대로 복용 완료</span>';
    } else if (diff < 0) {
      deltaHtml = '<span class="delta delta--short">실제 ' + actualDays + '일 복용 기록</span>';
    } else {
      deltaHtml = '<span class="delta delta--over">' + diff + '일 초과</span>';
    }
    return (
      '<div class="compare-bar">' +
        '<div class="compare-row"><span class="compare-label">처방</span>' +
          '<div class="compare-track"><div class="compare-fill compare-fill--prescribed" style="width:' + prescribedPct + '%"></div></div>' +
          '<span class="compare-value">' + prescribedDays + '일</span></div>' +
        '<div class="compare-row"><span class="compare-label">실제</span>' +
          '<div class="compare-track"><div class="compare-fill compare-fill--actual' + (ongoing ? " compare-fill--ongoing" : "") + '" style="width:' + actualPct + '%"></div></div>' +
          '<span class="compare-value">' + actualDays + '일</span></div>' +
        '<div class="compare-delta">' + deltaHtml + '</div>' +
      '</div>'
    );
  }

  function renderSummary() {
    var records = state.data.records;
    if (records.length === 0) {
      return '<div class="empty">' +
        '<div class="empty__icon">' + ICONS.box + '</div>' +
        '<div class="empty__title">아직 요약할 기록이 없어요</div>' +
        '<div class="empty__desc">병원 방문과 처방을 기록하면<br>여기서 자동으로 요약해 드려요.</div>' +
        '<div class="empty__actions"><button type="button" class="btn btn-primary" data-action="go-add">' + ICONS.plus + ' 기록 추가하기</button></div>' +
      '</div>';
    }

    var hospitals = sortByDateDesc(getRecords("hospital"));
    var symptoms = sortByDateDesc(getRecords("symptom"));
    var prescriptions = getRecords("prescription");
    var intakes = getRecords("intake");
    var summaries = buildMedicationSummaries();
    var antibiotics = summaries.filter(function (s) { return isAntibiotic(s.prescription); });

    var html = "";

    // 0) 아이 정보 (체중 참고 표시) + 진료/보호자 공유 문구 복사 버튼
    var child = state.data.child;
    var infoParts = [];
    if (child.name) infoParts.push(escapeHtml(child.name));
    var ageStr = ageString(child.birthDate);
    if (ageStr) infoParts.push(ageStr);
    var wStr = weightString(child.weight);
    if (wStr) infoParts.push(wStr + " (참고용)");
    html += '<div class="summary-childbar">' +
      '<div class="summary-childbar__info">' + (infoParts.length ? infoParts.join(" · ") : "아이 정보를 설정에서 입력해 주세요") + '</div>' +
      '<button type="button" class="btn btn-soft btn-sm" data-action="copy-summary">' + ICONS.copy + ' 진료/보호자 공유 문구 복사</button>' +
    '</div>' +
    '<p class="summary-childbar__hint">복사한 문구는 병원 진료 시 보여주거나, 배우자·조부모에게 카카오톡으로 공유할 수 있어요.</p>';

    // 1) 자동 브리핑 — 기록을 바탕으로 자동 정리한 문단
    var briefingText = generateSummaryBriefing();
    if (briefingText) {
      html += '<div class="summary-briefing">' +
        '<div class="summary-briefing__eyebrow">' + ICONS.sparkle + ' 자동 브리핑</div>' +
        '<div class="summary-briefing__text">' + briefingText + '</div>' +
        '<div class="summary-briefing__foot">기록을 바탕으로 자동으로 정리했어요. 판단은 의사·약사와 상의해 주세요.</div>' +
      '</div>';
    }

    // 2) 항생제 이력 — 별도 강조 패널
    if (antibiotics.length > 0) {
      html += '<div class="antibiotic-panel">' +
        '<div class="antibiotic-panel__head">' +
          '<span class="antibiotic-panel__title">' + ICONS.shield + ' 항생제 이력</span>' +
          '<span class="antibiotic-panel__count">' + antibiotics.length + '건</span>' +
        '</div>' +
        '<div class="antibiotic-panel__desc">항생제 복용 이력을 기록하고, 처방 일수와 실제 복용 일수를 구분해 보여줘요.</div>' +
        '<div class="antibiotic-panel__list">' + antibiotics.map(function (s) {
          var daysText = s.actualDays === null ? "복용 기록 없음" :
            (s.ongoing ? s.actualDays + "일째 복용중" : "실제 " + s.actualDays + "일 / 처방 " + s.prescription.prescribedDays + "일");
          return '<button type="button" class="antibiotic-mini-row" data-action="open-detail" data-id="' + s.prescription.id + '">' +
            '<span class="antibiotic-mini-row__name">' + escapeHtml(s.prescription.medName) + '</span>' +
            '<span class="antibiotic-mini-row__days">' + daysText + '</span>' +
          '</button>';
        }).join("") + '</div>' +
      '</div>';
    }

    // 3) 핵심 지표
    html += '<div class="stat-grid">' +
      statBox(hospitals.length, "병원 방문") +
      statBox(symptoms.length, "증상 기록") +
      statBox(prescriptions.length, "처방") +
      statBox(intakes.length, "실제 복용") +
      statBox(antibiotics.length, "항생제 처방") +
      statBox(getRecords("discontinuation").length, "중단 기록") +
    '</div>';

    // 4) 약별 처방 vs 실제 복용 비교 (핵심)
    html += '<div class="screen-section">' +
      '<div class="screen-section__head"><span class="screen-section__title">약별 처방 vs 실제 복용 비교</span></div>';
    if (summaries.length === 0) {
      html += '<div class="card u-muted" style="font-size:12.5px;">등록된 처방이 없어요.</div>';
    } else {
      html += summaries.map(function (s) {
        var isAnti = isAntibiotic(s.prescription);
        return '<div class="card compare-card">' +
          '<div class="compare-card__head">' +
            '<span class="compare-card__name">' + escapeHtml(s.prescription.medName) +
              (s.prescription.dose ? ' <span class="compare-card__dose">' + escapeHtml(s.prescription.dose) + '</span>' : "") +
              (isAnti ? ' <span class="badge badge-antibiotic">항생제</span>' : ' <span class="badge badge-cat">' + escapeHtml(s.prescription.category) + '</span>') +
            '</span>' +
            '<span class="compare-card__date">' + formatDateShort(s.prescription.date) + '</span>' +
          '</div>' +
          compareBarHtml(s.prescription.prescribedDays, s.actualDays, s.ongoing) +
          (s.discontinuation ? '<div class="compare-stop">' + ICONS.stop + ' 중단 사유: ' + escapeHtml(s.discontinuation.reason) + (s.discontinuation.reaction ? " · " + escapeHtml(s.discontinuation.reaction) : "") + '</div>' : "") +
        '</div>';
      }).join("");
    }
    html += '</div>';

    // 병원 방문 이력
    html += '<div class="screen-section">' +
      '<div class="screen-section__head"><span class="screen-section__title">병원 방문 이력</span></div>' +
      '<div class="card">' + (hospitals.length === 0 ? '<p class="u-muted" style="font-size:12.5px;">기록 없음</p>' : hospitals.slice(0, 6).map(function (h) {
        return '<div class="mini-list-item"><span><span class="mini-list-item__main">' + escapeHtml(h.hospitalName) + '</span> · <span class="mini-list-item__sub">' + escapeHtml(h.diagnosis) + '</span></span><span class="mini-list-item__date">' + formatDateShort(h.date) + '</span></div>';
      }).join("")) + '</div>' +
    '</div>';

    // 증상 흐름
    html += '<div class="screen-section">' +
      '<div class="screen-section__head"><span class="screen-section__title">증상 흐름</span></div>' +
      '<div class="card">' + (symptoms.length === 0 ? '<p class="u-muted" style="font-size:12.5px;">기록 없음</p>' : symptoms.slice(0, 8).map(function (s) {
        return '<div class="mini-list-item"><span><span class="mini-list-item__main">' + escapeHtml(s.symptom) + '</span> · <span class="mini-list-item__sub">' + escapeHtml(s.severity) + '</span></span><span class="mini-list-item__date">' + formatDateShort(s.date) + '</span></div>';
      }).join("")) + '</div>' +
    '</div>';

    // 복용 중 반응 이력
    var reactions = sortByDateDesc(getRecords("reaction"));
    var antibioticNames = {};
    getRecords("prescription").forEach(function (pp) { if (isAntibiotic(pp)) antibioticNames[(pp.medName || "").trim()] = true; });
    html += '<div class="screen-section">' +
      '<div class="screen-section__head"><span class="screen-section__title">복용 중 반응 이력</span></div>' +
      '<div class="card">' + (reactions.length === 0 ? '<p class="u-muted" style="font-size:12.5px;">기록 없음</p>' : reactions.map(function (r) {
        var isAntiReaction = r.medName && antibioticNames[(r.medName || "").trim()];
        return '<div class="mini-list-item">' +
          '<span>' +
            '<span class="mini-list-item__main">' + escapeHtml(r.reactionType || "반응") + '</span> · ' +
            '<span class="mini-list-item__sub">' + escapeHtml(r.severity || "") + (r.medName ? " · " + escapeHtml(r.medName) : "") + '</span>' +
            (isAntiReaction ? ' <span class="badge badge-reaction">항생제 복용 중 기록</span>' : "") +
            (r.memo ? '<span class="mini-list-item__memo">' + escapeHtml(r.memo) + '</span>' : "") +
          '</span>' +
          '<span class="mini-list-item__date">' + formatDateShort(r.date) + '</span>' +
        '</div>';
      }).join("")) + '</div>' +
    '</div>';

    // 하단 의료 안전 문구 (강화판)
    html += '<p class="app-footer-note">' + escapeHtml(SAFETY_NOTICE_FULL) + '</p>';

    return html;
  }

  function statBox(num, label) {
    return '<div class="stat-box"><div class="stat-box__num">' + num + '</div><div class="stat-box__label">' + label + '</div></div>';
  }

  function bindSummary() {
    var root = document.getElementById("screenRoot");
    root.querySelectorAll('[data-action="go-add"]').forEach(function (el) {
      el.addEventListener("click", function () { goTo("add"); });
    });
    root.querySelectorAll('[data-action="open-detail"]').forEach(function (el) {
      el.addEventListener("click", function () { openRecordDetail(el.getAttribute("data-id")); });
    });
    root.querySelectorAll('[data-action="copy-summary"]').forEach(function (el) {
      el.addEventListener("click", function () { copySummaryText(); });
    });
  }

  /* 진료/보호자 공유용 요약 문구 생성 (표시 전용, 데이터 변경 없음) */
  function buildSummaryText() {
    var child = state.data.child;
    var lines = [];
    var name = child.name ? child.name : "우리 아이";
    lines.push("[아이약쏙 진료 요약 · " + name + "]");

    var infoParts = [];
    var ageStr = ageString(child.birthDate);
    if (ageStr) infoParts.push(ageStr);
    var wStr = weightString(child.weight);
    if (wStr) infoParts.push(wStr + " (참고용)");
    if (infoParts.length) lines.push("아이 정보: " + infoParts.join(" · "));

    var hospitals = sortByDateAsc(getRecords("hospital"));
    if (hospitals.length > 0) {
      var first = hospitals[0], last = hospitals[hospitals.length - 1];
      var range = hospitals.length > 1 ? formatDateShort(first.date) + " ~ " + formatDateShort(last.date) : formatDateShort(first.date);
      var hospitalNames = {};
      hospitals.forEach(function (h) { hospitalNames[h.hospitalName] = true; });
      var hn = Object.keys(hospitalNames);
      lines.push(range + " " + (hn.length === 1 ? hn[0] + " " : "") + hospitals.length + "회 방문");
      var diagnosisChain = hospitals.map(function (h) { return h.diagnosis; }).filter(function (d, i, arr) { return i === 0 || arr[i - 1] !== d; });
      if (diagnosisChain.length) lines.push("진단 흐름: " + diagnosisChain.join(" → "));
    }

    var summaries = buildMedicationSummaries();
    if (summaries.length > 0) {
      lines.push("");
      lines.push("처방/복용 요약:");
      summaries.forEach(function (s) {
        var catLabel = s.prescription.category ? "(" + s.prescription.category + ")" : "";
        var doseLabel = s.prescription.dose ? " " + s.prescription.dose : "";
        var line = "· " + s.prescription.medName + doseLabel + catLabel + ": ";
        if (s.actualDays === null) {
          line += "처방 " + s.prescription.prescribedDays + "일 / 실제 복용 기록 없음";
        } else if (s.ongoing) {
          line += "복용 " + s.actualDays + "일째 (진행 중)";
        } else {
          line += "처방 " + s.prescription.prescribedDays + "일 / 실제 " + s.actualDays + "일";
        }
        lines.push(line);
        // 처방보다 짧게 복용한 경우: 의료진 안내 맥락을 반드시 병기 (임의 중단 뉘앙스 금지)
        if (!s.ongoing && s.actualDays !== null && s.actualDays < s.prescription.prescribedDays) {
          lines.push("  - 기록상 실제 복용 기간이 처방 기간보다 짧게 기록됨");
          if (s.discontinuation && s.discontinuation.reason) {
            lines.push("  - 사유: " + s.discontinuation.reason + ", 의료진 안내에 따라 기록");
          }
        }
      });
    }

    var reactions = sortByDateAsc(getRecords("reaction"));
    if (reactions.length > 0) {
      lines.push("");
      lines.push("복용 중 반응 기록:");
      reactions.forEach(function (r) {
        var sev = r.severity ? "(" + r.severity + ")" : "";
        var med = r.medName ? ": " + r.medName + " 복용 중" : "";
        var memo = r.memo ? " " + r.memo : "";
        lines.push("· " + formatDateShort(r.date) + " " + (r.reactionType || "반응") + sev + med + memo);
      });
    }

    var ongoing = sortByDateDesc(getRecords("intake").filter(function (i) { return i.status === "복용중"; }));
    lines.push("");
    if (ongoing.length > 0) {
      lines.push("현재 복용 중인 약: " + ongoing.map(function (i) { return i.medName; }).join(", "));
    } else {
      lines.push("현재 복용 중인 약: 없음");
    }

    lines.push("");
    lines.push("※ " + SAFETY_NOTICE_SHORT);

    return lines.join("\n");
  }

  function copySummaryText() {
    var text = buildSummaryText();
    function fallbackCopy() {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand("copy");
        document.body.removeChild(ta);
        if (ok) toast("요약 문구가 복사되었어요");
        else toast("복사에 실패했어요. 길게 눌러 직접 복사해 주세요.");
      } catch (e) {
        toast("복사에 실패했어요. 길게 눌러 직접 복사해 주세요.");
      }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        toast("요약 문구가 복사되었어요");
      }).catch(function () {
        fallbackCopy();
      });
    } else {
      fallbackCopy();
    }
  }

  /* ==================================================================== *
   * SETTINGS
   * ==================================================================== */
  function renderSettings() {
    var child = state.data.child;
    var html = "";

    html += '<div class="settings-group">' +
      '<div class="settings-group__title">아이 정보</div>' +
      '<div class="card">' +
        '<form id="childForm">' +
          '<div class="field"><span class="field__label">이름</span>' +
            '<input class="input" type="text" name="name" placeholder="예: 서준" value="' + escapeHtml(child.name || "") + '"></div>' +
          '<div class="field"><span class="field__label">생년월일</span>' +
            '<input class="input" type="date" name="birthDate" value="' + (child.birthDate || "") + '"></div>' +
          '<div class="field"><span class="field__label">체중 (kg)</span>' +
            '<input class="input" type="number" name="weight" inputmode="decimal" step="0.1" min="0" placeholder="예: 12.5" value="' + escapeHtml(child.weight || "") + '">' +
            '<p class="field__hint">체중은 약 용량 계산에 사용되지 않으며, 진료 요약 참고 정보로만 표시됩니다.</p></div>' +
          '<div class="field u-mt-0"><span class="field__label">알레르기 / 특이사항</span>' +
            '<textarea class="textarea" name="note" placeholder="예: 특이사항 없음">' + escapeHtml(child.note || "") + '</textarea></div>' +
          '<button type="submit" class="btn btn-primary btn-block">아이 정보 저장</button>' +
        '</form>' +
      '</div>' +
    '</div>';

    html += '<div class="settings-group">' +
      '<div class="settings-group__title">데이터 관리</div>' +
      '<div class="card">' +
        '<div class="settings-row">' +
          '<div><div class="settings-row__label">샘플 데이터 생성</div><div class="settings-row__desc">예시 기록을 추가해 앱을 둘러볼 수 있어요</div></div>' +
          '<button type="button" class="btn btn-soft btn-sm" data-action="sample">생성</button>' +
        '</div>' +
        '<div class="settings-row">' +
          '<div><div class="settings-row__label">전체 기록 개수</div><div class="settings-row__desc">' + state.data.records.length + '건 저장됨</div></div>' +
        '</div>' +
      '</div>' +
    '</div>';

    html += '<div class="settings-group">' +
      '<div class="settings-group__title">위험 영역</div>' +
      '<div class="card danger-box">' +
        '<div class="settings-row">' +
          '<div><div class="settings-row__label">모든 데이터 삭제</div><div class="settings-row__desc">아이 정보와 모든 기록이 삭제돼요</div></div>' +
          '<button type="button" class="btn btn-danger btn-sm" data-action="clear-all">삭제</button>' +
        '</div>' +
      '</div>' +
    '</div>';

    html += '<div class="settings-group">' +
      '<div class="notice-box">' +
        '<span class="notice-box__icon">' + ICONS.info + '</span>' +
        '<span>' + escapeHtml(SAFETY_NOTICE_FULL) + '</span>' +
      '</div>' +
    '</div>';

    html += '<p class="app-footer-note">아이약쏙 v1.0 · 모든 데이터는 이 기기에만 저장됩니다.</p>';

    return html;
  }

  function bindSettings() {
    var root = document.getElementById("screenRoot");
    var form = document.getElementById("childForm");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        state.data.child = {
          name: getFormValue(form, "name"),
          birthDate: getFormValue(form, "birthDate"),
          weight: getFormValue(form, "weight"),
          note: getFormValue(form, "note")
        };
        saveData();
        toast("아이 정보가 저장되었어요.");
        render();
      });
    }
    root.querySelectorAll('[data-action="sample"]').forEach(function (el) {
      el.addEventListener("click", function () { generateSampleData(); });
    });
    root.querySelectorAll('[data-action="clear-all"]').forEach(function (el) {
      el.addEventListener("click", function () {
        if (window.confirm("정말 삭제하시겠어요? 이 작업은 되돌릴 수 없습니다.")) {
          state.data = defaultData();
          saveData();
          toast("모든 데이터가 삭제되었어요.");
          goTo("home");
        }
      });
    });
  }

  /* ==================================================================== *
   * 레코드 상세 모달
   * ==================================================================== */
  function openRecordDetail(id) {
    var r = findRecordById(id);
    if (!r) return;
    var meta = TYPE_META[r.type];
    var html = '<div class="modal__head"><span class="modal__title">' + meta.label + ' 기록</span>' +
      '<button type="button" class="modal__close" data-action="close-modal">' + ICONS.close + '</button></div>';

    html += '<dl>' + detailRows(r) + '</dl>';

    if (r.type === "intake" && r.status === "복용중") {
      html += '<div class="modal__divider"></div>' +
        '<div class="modal__section-title">복용 종료 처리</div>' +
        '<div id="endIntakeArea">' +
          '<div class="field"><span class="field__label">종료일</span><input class="input" type="date" id="endIntakeDate" value="' + todayStr() + '"></div>' +
          '<div class="field"><span class="field__label">상태</span>' +
            '<div class="segmented" id="endIntakeStatusSeg">' +
              '<button type="button" class="segmented__btn is-selected" data-value="완료">완료</button>' +
              '<button type="button" class="segmented__btn" data-value="중단">중단</button>' +
            '</div></div>' +
          '<div id="endIntakeReasonArea" style="display:none;">' +
            '<div class="field"><span class="field__label">중단 사유</span>' +
              '<div class="chip-row" id="endReasonChips">' + REASON_OPTIONS.map(function (rr) {
                return '<button type="button" class="chip chip-sm" data-value="' + rr + '">' + rr + '</button>';
              }).join("") + '</div></div>' +
            '<div class="field"><span class="field__label">특이 반응</span><input class="input" type="text" id="endIntakeReaction" placeholder="예: 특별한 반응 없음"></div>' +
          '</div>' +
          '<button type="button" class="btn btn-primary btn-block" data-action="confirm-end-intake" data-id="' + r.id + '">복용 종료 저장</button>' +
        '</div>';
    }

    if (r.type === "prescription") {
      html += '<div class="modal__actions">' +
        '<button type="button" class="btn btn-soft" data-action="prefill-intake" data-medname="' + escapeHtml(r.medName) + '">실제 복용 기록하기</button>' +
      '</div>';
    }
    if (r.type === "hospital") {
      html += '<div class="modal__actions">' +
        '<button type="button" class="btn btn-soft" data-action="prefill-prescription" data-date="' + r.date + '">처방 기록 추가하기</button>' +
      '</div>';
    }

    html += '<div class="modal__actions">' +
      '<button type="button" class="btn btn-ghost" data-action="edit-record" data-id="' + r.id + '">' + ICONS.edit + ' 수정</button>' +
      '<button type="button" class="btn btn-danger" data-action="delete-record" data-id="' + r.id + '">' + ICONS.trash + ' 삭제</button>' +
    '</div>';

    openModal(html);
    bindModal(r);
  }

  function detailRows(r) {
    var rows = [];
    rows.push(["날짜", formatDate(r.date)]);
    if (r.type === "symptom") {
      rows.push(["증상", r.symptom]);
      rows.push(["심각도", r.severity]);
      if (r.memo) rows.push(["메모", r.memo]);
    } else if (r.type === "hospital") {
      rows.push(["병원명", r.hospitalName]);
      rows.push(["진단명", r.diagnosis]);
      if (r.doctorMemo) rows.push(["의사 메모", r.doctorMemo]);
    } else if (r.type === "prescription") {
      rows.push(["약 이름", r.medName]);
      if (r.dose) rows.push(["용량", r.dose]);
      rows.push(["약 분류", r.category]);
      rows.push(["처방 일수", r.prescribedDays + "일"]);
      rows.push(["하루 복용 횟수", r.timesPerDay + "회"]);
      if (r.doctorInstruction) rows.push(["의사 지시", r.doctorInstruction]);
    } else if (r.type === "intake") {
      rows.push(["약 이름", r.medName]);
      rows.push(["시작일", formatDateShort(r.startDate)]);
      rows.push(["종료일", r.endDate ? formatDateShort(r.endDate) : "진행 중"]);
      rows.push(["상태", r.status]);
      var days = r.status === "복용중" ? daysBetween(r.startDate, todayStr()) : daysBetween(r.startDate, r.endDate || r.startDate);
      rows.push(["실제 복용 일수", days + "일"]);
    } else if (r.type === "discontinuation") {
      rows.push(["약 이름", r.medName]);
      rows.push(["중단 사유", r.reason]);
      if (r.reaction) rows.push(["특이 반응", r.reaction]);
    } else if (r.type === "reaction") {
      if (r.medName) rows.push(["관련 약 이름", r.medName]);
      rows.push(["반응 유형", r.reactionType || "-"]);
      rows.push(["심각도", r.severity || "-"]);
      if (r.memo) rows.push(["메모", r.memo]);
    }
    return rows.map(function (pair) {
      return '<div class="modal__row"><dt>' + pair[0] + '</dt><dd>' + escapeHtml(String(pair[1])) + '</dd></div>';
    }).join("");
  }

  function bindModal(record) {
    var modal = document.getElementById("modalBody");

    modal.querySelectorAll('[data-action="close-modal"]').forEach(function (el) {
      el.addEventListener("click", closeModal);
    });

    modal.querySelectorAll('[data-action="edit-record"]').forEach(function (el) {
      el.addEventListener("click", function () {
        state.editingId = el.getAttribute("data-id");
        closeModal();
        state.screen = "add";
        render();
        document.getElementById("screenRoot").scrollTop = 0;
      });
    });

    modal.querySelectorAll('[data-action="delete-record"]').forEach(function (el) {
      el.addEventListener("click", function () {
        if (window.confirm("이 기록을 삭제하시겠어요? 되돌릴 수 없습니다.")) {
          deleteRecord(el.getAttribute("data-id"));
          closeModal();
          toast("삭제되었어요.");
          render();
        }
      });
    });

    modal.querySelectorAll('[data-action="prefill-intake"]').forEach(function (el) {
      el.addEventListener("click", function () {
        state.prefill = { medName: el.getAttribute("data-medname") };
        state.addType = "intake";
        closeModal();
        goTo("add");
      });
    });

    modal.querySelectorAll('[data-action="prefill-prescription"]').forEach(function (el) {
      el.addEventListener("click", function () {
        state.prefill = { date: el.getAttribute("data-date") };
        state.addType = "prescription";
        closeModal();
        goTo("add");
      });
    });

    // 복용 종료 처리 (intake in-progress)
    var statusSeg = document.getElementById("endIntakeStatusSeg");
    var reasonArea = document.getElementById("endIntakeReasonArea");
    var selectedEndStatus = "완료";
    var selectedReason = "";
    if (statusSeg) {
      statusSeg.querySelectorAll(".segmented__btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          statusSeg.querySelectorAll(".segmented__btn").forEach(function (b) { b.classList.remove("is-selected"); });
          btn.classList.add("is-selected");
          selectedEndStatus = btn.getAttribute("data-value");
          if (reasonArea) reasonArea.style.display = selectedEndStatus === "중단" ? "block" : "none";
        });
      });
    }
    var reasonChips = document.getElementById("endReasonChips");
    if (reasonChips) {
      reasonChips.querySelectorAll(".chip").forEach(function (chip) {
        chip.addEventListener("click", function () {
          reasonChips.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("is-selected"); });
          chip.classList.add("is-selected");
          selectedReason = chip.getAttribute("data-value");
        });
      });
    }
    modal.querySelectorAll('[data-action="confirm-end-intake"]').forEach(function (el) {
      el.addEventListener("click", function () {
        var id = el.getAttribute("data-id");
        var endDateInput = document.getElementById("endIntakeDate");
        var endDate = endDateInput ? endDateInput.value : todayStr();
        if (endDate < record.startDate) {
          window.alert("종료일은 시작일 이후여야 해요.");
          return;
        }
        if (selectedEndStatus === "중단" && !selectedReason) {
          window.alert("중단 사유를 선택해 주세요.");
          return;
        }
        updateRecord(id, { status: selectedEndStatus, endDate: endDate });
        if (selectedEndStatus === "중단") {
          var reactionInput = document.getElementById("endIntakeReaction");
          addRecord({
            type: "discontinuation",
            date: endDate,
            medName: record.medName,
            reason: selectedReason,
            reaction: reactionInput ? reactionInput.value.trim() : ""
          });
        }
        closeModal();
        toast("복용 상태가 업데이트되었어요.");
        render();
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * 7. 샘플 데이터
   * ------------------------------------------------------------------ */
  function generateSampleData() {
    var today = todayStr();
    function d(offset) { return addDaysStr(today, offset); }

    if (!state.data.child.name) {
      state.data.child = { name: "서준", birthDate: addDaysStr(today, -2 * 365 - 90), weight: "12.5", note: "특이 알레르기 없음" };
    } else if (!state.data.child.weight) {
      state.data.child.weight = "12.5";
    }

    // 핵심 시나리오: 항생제 5일 처방 → 반응 기록 → 증상 호전 → 실제 3일 복용 후 의료진 안내로 중단
    var sample = [
      // 1차: 기침 → 기관지염 → 항생제 5일 처방 → 반응 → 3일 복용 후 중단
      { type: "symptom", date: d(-3), symptom: "기침", severity: "보통", memo: "밤에 기침이 심해짐" },
      { type: "hospital", date: d(-3), hospitalName: "OO소아과", diagnosis: "급성 기관지염", doctorMemo: "증상 호전 시 중단 가능하다고 안내받음" },
      { type: "prescription", date: d(-3), medName: "세프클러현탁액", category: "항생제", prescribedDays: 5, timesPerDay: 3, doctorInstruction: "증상 호전 시 중단 가능" },
      { type: "intake", date: d(-3), medName: "세프클러현탁액", startDate: d(-3), endDate: d(-1), status: "중단" },
      { type: "reaction", date: d(-2), medName: "세프클러현탁액", reactionType: "설사", severity: "약함", memo: "묽은 변 1회" },
      { type: "symptom", date: d(-1), symptom: "기침", severity: "약함", memo: "기침 호전됨" },
      { type: "discontinuation", date: d(-1), medName: "세프클러현탁액", reason: "증상 호전", reaction: "의료진 안내에 따라 중단" },

      // 2차: 콧물 → 비염 → 기침약 완료 복용
      { type: "symptom", date: d(-2), symptom: "콧물", severity: "보통", memo: "맑은 콧물" },
      { type: "prescription", date: d(-2), medName: "코푸시럽", category: "기침약", prescribedDays: 5, timesPerDay: 3, doctorInstruction: "식후 30분 복용" },
      { type: "intake", date: d(-2), medName: "코푸시럽", startDate: d(-2), endDate: d(-1), status: "완료" },

      // 3차: 현재 진행 중 (소화기약)
      { type: "hospital", date: d(0), hospitalName: "OO소아과", diagnosis: "급성 위장관염", doctorMemo: "수분 섭취 권장, 3일치 정장제 처방" },
      { type: "prescription", date: d(0), medName: "정장제", category: "소화기약", prescribedDays: 3, timesPerDay: 2, doctorInstruction: "설사 지속 시 재방문" },
      { type: "intake", date: d(0), medName: "정장제", startDate: d(0), endDate: "", status: "복용중" }
    ];

    sample.forEach(function (rec) { addRecord(rec); });
    saveData();
    toast("샘플 데이터가 추가되었어요.");
    goTo("home");
  }

  /* ------------------------------------------------------------------ *
   * 8. 초기화
   * ------------------------------------------------------------------ */
  function setupShell() {
    document.querySelectorAll(".tab").forEach(function (el) {
      el.addEventListener("click", function () { goTo(el.getAttribute("data-screen")); });
    });
    document.getElementById("childBtn").addEventListener("click", function () { goTo("settings"); });
    document.getElementById("modalOverlay").addEventListener("click", function (e) {
      if (e.target === document.getElementById("modalOverlay")) closeModal();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    state.data = loadData();
    setupShell();
    render();
  });
})();
