document.addEventListener("DOMContentLoaded", () => {
  const doorTop = document.getElementById("doorTop");
  const doorBottom = document.getElementById("doorBottom");
  const freezer = document.getElementById("freezer");
  const cavity = document.getElementById("cavity");
  const doorLockStatus = document.getElementById("doorLockStatus");
  const statusDoorText = document.getElementById("statusDoorText");
  const statusMeta = document.getElementById("statusMeta");
  const fridgeOpens = document.getElementById("fridgeOpens");
  const todaysOpens = document.getElementById("todaysOpens");
  const lastOpened = document.getElementById("lastOpened");
  const unnecessaryCount = document.getElementById("unnecessaryCount");
  const warningText = document.getElementById("warningText");
  const irActivityText = document.getElementById("irActivityText");
  const irSensorText = document.getElementById("irSensorText");
  const buzzerStatusText = document.getElementById("buzzerStatusText");
  const buzzerStateText = document.getElementById("buzzerStateText");
  const rfidStatusValue = document.getElementById("rfidStatusValue");
  const rfidMessage = document.getElementById("rfidMessage");
  const moodLightState = document.getElementById("moodLightState");
  const esp32State = document.getElementById("esp32State");
  const esp32Chip = document.getElementById("esp32Chip");
  const wifiStateText = document.getElementById("wifiStateText");
  const wifiStatus = document.getElementById("wifiStatus");
  const deviceStatus = document.getElementById("deviceStatus");
  const lastDataReceived = document.getElementById("lastDataReceived");
  const doorStateCard = document.getElementById("doorStateCard");
  const container1Status = document.getElementById("container1Status");
  const container2Status = document.getElementById("container2Status");
  const activityLog = document.getElementById("activityLog");

  const doors = [doorTop, doorBottom];
  const API_URL = window.location.protocol === "file:" ? "http://localhost:5000/data" : "/data";

  const state = {
    doorState: "closed",
    fridgeOpenCount: 0,
    todaysOpenCount: 0,
    unnecessaryCount: 0,
    irActivity: false,
    rfidStatus: "waiting",
    lastRFID: "--",
    container1Locked: true,
    container2Locked: true,
    buzzerStatus: "OFF",
    rgbStatus: "PINK",
    esp32Connected: true,
    lastEvent: "System initialized",
    lastOpened: "--:--",
    unnecessaryTimer: null,
    buzzerTimer: null,
    moodPhase: 0,
    moodStates: ["PINK", "YELLOW", "GREEN", "PINK"]
  };

  function safeSetText(element, value) {
    if (element) element.textContent = String(value);
  }

  function timestamp() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function pushLog(type, description, status = "neutral") {
    const li = document.createElement("li");
    const now = timestamp();
    li.innerHTML = `
      <span class="log-time">${now}</span>
      <span class="log-type ${status}">${type}</span>
      <span class="log-text">${description}</span>
    `;
    activityLog.prepend(li);

    while (activityLog.children.length > 8) {
      activityLog.removeChild(activityLog.lastChild);
    }
  }

  function setDoorState(open) {
    state.doorState = open ? "open" : "closed";
    const anyDoorOpen = doors.some((d) => d.classList.contains("open"));
    cavity.classList.toggle("lit", anyDoorOpen);
    cavity.classList.toggle("open", anyDoorOpen);

    doorLockStatus.textContent = anyDoorOpen ? "FRIDGE UNLOCKED" : "FRIDGE LOCKED";
    doorLockStatus.classList.toggle("is-open", anyDoorOpen);
    statusDoorText.textContent = `DOOR: ${state.doorState.toUpperCase()}`;
    statusMeta.textContent = anyDoorOpen ? "FRIDGE UNLOCKED" : "FRIDGE LOCKED";
    statusMeta.classList.toggle("is-open", anyDoorOpen);
    doorStateCard.textContent = state.doorState.toUpperCase();
    lastDataReceived.textContent = timestamp();

    if (!anyDoorOpen) {
      state.container1Locked = true;
      state.container2Locked = true;
      updateContainerState();
      if (state.rfidStatus !== "unauthorized") {
        state.rfidStatus = "waiting";
      }
      updateRFIDDisplay();
      pushLog("DOOR", "Fridge door closed", "neutral");
    }
  }

  function applyServerData(data) {
    if (!data || typeof data !== "object") return;

    const normalizedDoor = String(data.door || "").toUpperCase();
    if (normalizedDoor === "OPEN") {
      doors.forEach((door) => {
        if (!door.classList.contains("open")) {
          door.classList.add("open");
          door.setAttribute("aria-expanded", "true");
        }
      });
      state.doorState = "open";
    } else if (normalizedDoor === "CLOSED") {
      doors.forEach((door) => {
        door.classList.remove("open");
        door.setAttribute("aria-expanded", "false");
      });
      state.doorState = "closed";
    }

    const openCountValue = Number(data.opens ?? state.fridgeOpenCount);
    if (!Number.isNaN(openCountValue)) {
      state.fridgeOpenCount = openCountValue;
      fridgeOpens.textContent = String(openCountValue);
    }

    const unnecessaryValue = Number(data.unnecessary ?? state.unnecessaryCount);
    if (!Number.isNaN(unnecessaryValue)) {
      state.unnecessaryCount = unnecessaryValue;
      unnecessaryCount.textContent = String(unnecessaryValue);
    }

    const container1State = String(data.container1 || "").toUpperCase();
    const container2State = String(data.container2 || "").toUpperCase();
    state.container1Locked = container1State !== "UNLOCKED";
    state.container2Locked = container2State !== "UNLOCKED";

    const anyDoorOpen = doors.some((d) => d.classList.contains("open"));
    cavity.classList.toggle("lit", anyDoorOpen);
    cavity.classList.toggle("open", anyDoorOpen);
    doorLockStatus.textContent = anyDoorOpen ? "FRIDGE UNLOCKED" : "FRIDGE LOCKED";
    doorLockStatus.classList.toggle("is-open", anyDoorOpen);
    statusDoorText.textContent = `DOOR: ${state.doorState.toUpperCase()}`;
    statusMeta.textContent = anyDoorOpen ? "FRIDGE UNLOCKED" : "FRIDGE LOCKED";
    statusMeta.classList.toggle("is-open", anyDoorOpen);
    doorStateCard.textContent = state.doorState.toUpperCase();
    updateContainerState();
    lastDataReceived.textContent = timestamp();

    if (data.rfidStatus) {
      const nextRfid = String(data.rfidStatus).toLowerCase();
      if (nextRfid === "authorized") state.rfidStatus = "authorized";
      else if (nextRfid === "unauthorized") state.rfidStatus = "unauthorized";
      else state.rfidStatus = "waiting";
      updateRFIDDisplay();
    }

    if (data.buzzerStatus) {
      state.buzzerStatus = String(data.buzzerStatus).toUpperCase();
      buzzerStatusText.textContent = state.buzzerStatus;
      buzzerStateText.textContent = state.buzzerStatus;
    }

    if (data.rgbStatus) {
      state.rgbStatus = String(data.rgbStatus).toUpperCase();
      moodLightState.textContent = state.rgbStatus;
    }

    if (typeof data.esp32Connected === "boolean") {
      state.esp32Connected = data.esp32Connected;
      refreshConnection();
    }
  }

  async function fetchFridgeData() {
    try {
      const response = await fetch(API_URL, {
        cache: "no-store",
        headers: { Accept: "application/json" }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      applyServerData(data);
      esp32State.textContent = "ONLINE";
      esp32Chip.textContent = "ONLINE";
      esp32Chip.classList.add("online-chip");
      esp32Chip.classList.remove("offline-chip");
      wifiStateText.textContent = "STABLE";
      wifiStatus.textContent = "CONNECTED";
      deviceStatus.textContent = "READY";
    } catch (error) {
      console.warn("Fridge data fetch failed:", error);
      esp32State.textContent = "OFFLINE";
      esp32Chip.textContent = "OFFLINE";
      esp32Chip.classList.add("offline-chip");
      esp32Chip.classList.remove("online-chip");
      wifiStateText.textContent = "LOST";
      wifiStatus.textContent = "OFFLINE";
      deviceStatus.textContent = "ERROR";
    }
  }

  function updateContainerState() {
    const cont1 = document.querySelector(".container-01");
    const cont2 = document.querySelector(".container-02");

    if (!cont1 || !cont2) return;

    cont1.classList.toggle("locked", state.container1Locked);
    cont1.classList.toggle("unlocked", !state.container1Locked);
    cont2.classList.toggle("locked", state.container2Locked);
    cont2.classList.toggle("unlocked", !state.container2Locked);

    const cont1Lock = cont1.querySelector(".container-lock");
    const cont2Lock = cont2.querySelector(".container-lock");
    const cont1Status = cont1.querySelector(".container-status");
    const cont2Status = cont2.querySelector(".container-status");

    if (cont1Lock) cont1Lock.textContent = state.container1Locked ? "🔒" : "🔓";
    if (cont2Lock) cont2Lock.textContent = state.container2Locked ? "🔒" : "🔓";
    if (cont1Status) cont1Status.textContent = state.container1Locked ? "LOCKED" : "UNLOCKED";
    if (cont2Status) cont2Status.textContent = state.container2Locked ? "LOCKED" : "UNLOCKED";

    safeSetText(container1Status, state.container1Locked ? "LOCKED" : "UNLOCKED");
    safeSetText(container2Status, state.container2Locked ? "LOCKED" : "UNLOCKED");

    cont1.classList.remove("pulse");
    cont2.classList.remove("pulse");
    void cont1.offsetWidth;
    if (!state.container1Locked) cont1.classList.add("pulse");
    if (!state.container2Locked) cont2.classList.add("pulse");
  }

  function updateRFIDDisplay() {
    const statusMap = {
      waiting: { label: "READY", message: "SCAN RFID TAG", className: "neutral" },
      authorized: { label: "ACCESS GRANTED", message: "ACCESS GRANTED", className: "approved" },
      unauthorized: { label: "ACCESS DENIED", message: "ACCESS DENIED", className: "denied" },
      warning: { label: "WARNING", message: "UNNECESSARY OPENING DETECTED", className: "warning" }
    };

    const stateRef = statusMap[state.rfidStatus] || statusMap.waiting;
    safeSetText(rfidStatusValue, stateRef.label);
    safeSetText(rfidMessage, stateRef.message);
    if (rfidStatusValue) rfidStatusValue.className = `rfid-status ${stateRef.className}`;
  }

  function toggleDoor(el) {
    const isOpen = el.classList.toggle("open");
    el.setAttribute("aria-expanded", String(isOpen));
    setDoorState(isOpen);

    if (isOpen) {
      state.lastOpened = timestamp();
      lastOpened.textContent = state.lastOpened;
      state.fridgeOpenCount += 1;
      state.todaysOpenCount += 1;
      fridgeOpens.textContent = state.fridgeOpenCount;
      todaysOpens.textContent = state.todaysOpenCount;
      pushLog("DOOR", "Fridge door opened", "ok");
      startUnnecessaryTimer();
    }
  }

  function startUnnecessaryTimer() {
    clearTimeout(state.unnecessaryTimer);
    state.unnecessaryTimer = setTimeout(() => {
      if (state.doorState !== "open") return;
      if (state.irActivity) return;

      state.unnecessaryCount += 1;
      state.rfidStatus = "warning";
      state.buzzerStatus = "ACTIVE";
      unnecessaryCount.textContent = state.unnecessaryCount;
      warningText.textContent = "UNNECESSARY OPENING DETECTED";
      warningText.classList.add("flash");
      buzzerStatusText.textContent = "ACTIVE";
      buzzerStateText.textContent = "ACTIVE";
      updateRFIDDisplay();
      pushLog("WARNING", "Unnecessary opening detected", "warning");
      setTimeout(() => {
        warningText.classList.remove("flash");
        state.buzzerStatus = "OFF";
        buzzerStatusText.textContent = "OFF";
        buzzerStateText.textContent = "OFF";
      }, 2000);
    }, 5000);
  }

  function detectActivity() {
    state.irActivity = true;
    clearTimeout(state.unnecessaryTimer);
    irActivityText.textContent = "ACTIVE";
    irSensorText.textContent = "ACTIVE";
    irActivityText.classList.add("active");
    pushLog("IR", "Activity detected", "ok");
    setTimeout(() => {
      state.irActivity = false;
      irActivityText.textContent = "IDLE";
      irSensorText.textContent = "IDLE";
      irActivityText.classList.remove("active");
      if (state.doorState === "open") {
        startUnnecessaryTimer();
      }
    }, 1200);
  }

  function setBuzzer(stateName) {
    if (stateName === "active") {
      state.buzzerStatus = "ACTIVE";
      buzzerStatusText.textContent = "ACTIVE";
      buzzerStateText.textContent = "ACTIVE";
      clearTimeout(state.buzzerTimer);
      state.buzzerTimer = setTimeout(() => {
        state.buzzerStatus = "OFF";
        buzzerStatusText.textContent = "OFF";
        buzzerStateText.textContent = "OFF";
      }, 2000);
    } else {
      state.buzzerStatus = "OFF";
      buzzerStatusText.textContent = "OFF";
      buzzerStateText.textContent = "OFF";
    }
  }

  function triggerRFID(tag) {
    if (state.doorState !== "open") {
      pushLog("RFID", "Door closed; scan ignored", "warning");
      return;
    }

    if (tag === 1) {
      state.lastRFID = "ROOMMATE 01";
      state.container1Locked = false;
      state.container2Locked = true;
      state.rfidStatus = "authorized";
      state.buzzerStatus = "OFF";
      rfidMessage.textContent = "CONTAINER 01 UNLOCKED";
      pushLog("RFID", "Container 01 unlocked", "ok");
      setBuzzer("off");
      updateContainerState();
      updateRFIDDisplay();
    } else if (tag === 2) {
      state.lastRFID = "ROOMMATE 02";
      state.container2Locked = false;
      state.container1Locked = true;
      state.rfidStatus = "authorized";
      state.buzzerStatus = "OFF";
      rfidMessage.textContent = "CONTAINER 02 UNLOCKED";
      pushLog("RFID", "Container 02 unlocked", "ok");
      setBuzzer("off");
      updateContainerState();
      updateRFIDDisplay();
    } else {
      state.lastRFID = "UNAUTHORIZED";
      state.rfidStatus = "unauthorized";
      state.container1Locked = true;
      state.container2Locked = true;
      updateContainerState();
      rfidMessage.textContent = "ACCESS DENIED";
      pushLog("RFID", "Unauthorized RFID detected", "warning");
      setBuzzer("active");
      updateRFIDDisplay();
      setTimeout(() => {
        state.rfidStatus = "waiting";
        updateRFIDDisplay();
      }, 1800);
    }
  }

  function updateMoodLight() {
    const states = ["PINK", "YELLOW", "GREEN", "PINK"];
    const palette = {
      PINK: "linear-gradient(90deg, rgba(255,120,180,0.6), rgba(255,206,120,0.75), rgba(120,255,180,0.7))",
      YELLOW: "linear-gradient(90deg, rgba(255,210,110,0.75), rgba(250,178,70,0.75), rgba(250,240,150,0.76))",
      GREEN: "linear-gradient(90deg, rgba(110,255,170,0.7), rgba(85,200,160,0.74), rgba(120,220,255,0.7))"
    };

    state.rgbStatus = states[state.moodPhase % states.length];
    if (moodLightState) moodLightState.textContent = state.rgbStatus;

    const moodBar = document.querySelector(".mood-light-bar");
    if (moodBar) {
      moodBar.style.background = palette[state.rgbStatus];
    }

    state.moodPhase += 1;
  }

  function refreshConnection() {
    safeSetText(esp32State, state.esp32Connected ? "ONLINE" : "OFFLINE");
    safeSetText(esp32Chip, state.esp32Connected ? "ONLINE" : "OFFLINE");
    if (esp32Chip) {
      esp32Chip.classList.toggle("online-chip", state.esp32Connected);
      esp32Chip.classList.toggle("offline-chip", !state.esp32Connected);
    }
    safeSetText(wifiStateText, state.esp32Connected ? "STABLE" : "LOST");
    safeSetText(wifiStatus, state.esp32Connected ? "CONNECTED" : "OFFLINE");
    safeSetText(deviceStatus, state.esp32Connected ? "READY" : "ERROR");
  }

  function resetCounters() {
    state.fridgeOpenCount = 0;
    state.todaysOpenCount = 0;
    state.unnecessaryCount = 0;
    state.lastOpened = "--:--";
    unnecessaryCount.textContent = "0";
    fridgeOpens.textContent = "0";
    todaysOpens.textContent = "0";
    lastOpened.textContent = "--:--";
    warningText.textContent = "MONITORING";
    state.rfidStatus = "waiting";
    updateRFIDDisplay();
    pushLog("SYSTEM", "Counters reset", "neutral");
  }

  function bindDemoControls() {
    document.querySelectorAll("[data-demo]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.demo;

        if (action === "open") {
          if (state.doorState === "closed") {
            toggleDoor(doorTop);
            toggleDoor(doorBottom);
          }
        }

        if (action === "auth1") triggerRFID(1);
        if (action === "auth2") triggerRFID(2);
        if (action === "unauth") triggerRFID(99);
        if (action === "activity") detectActivity();
        if (action === "unnecessary") {
          if (state.doorState === "open") {
            startUnnecessaryTimer();
            if (state.unnecessaryTimer) {
              clearTimeout(state.unnecessaryTimer);
              state.unnecessaryTimer = setTimeout(() => {
                state.unnecessaryCount += 1;
                state.rfidStatus = "warning";
                state.buzzerStatus = "ACTIVE";
                unnecessaryCount.textContent = state.unnecessaryCount;
                warningText.textContent = "UNNECESSARY OPENING DETECTED";
                warningText.classList.add("flash");
                buzzerStatusText.textContent = "ACTIVE";
                buzzerStateText.textContent = "ACTIVE";
                updateRFIDDisplay();
                pushLog("WARNING", "Unnecessary opening detected", "warning");
                setTimeout(() => {
                  warningText.classList.remove("flash");
                  state.buzzerStatus = "OFF";
                  buzzerStatusText.textContent = "OFF";
                  buzzerStateText.textContent = "OFF";
                }, 1800);
              }, 5000);
            }
          }
        }

        if (action === "close") {
          doors.forEach((door) => {
            door.classList.remove("open");
            door.setAttribute("aria-expanded", "false");
          });
          setDoorState(false);
          state.rfidStatus = "waiting";
          updateRFIDDisplay();
        }

        if (action === "reset") resetCounters();
      });
    });
  }

  doors.forEach((door) => {
    door.addEventListener("click", () => toggleDoor(door));
    door.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleDoor(door);
      }
    });
  });

  freezer.addEventListener("click", () => {
    freezer.classList.toggle("open");
    freezer.setAttribute("aria-expanded", String(freezer.classList.contains("open")));
  });

  pushLog("SYSTEM", "System initialized", "ok");
  updateRFIDDisplay();
  updateContainerState();
  updateMoodLight();
  refreshConnection();
  bindDemoControls();
  fetchFridgeData();

  setInterval(() => {
    updateMoodLight();
    fetchFridgeData();
    if (state.esp32Connected) {
      const now = timestamp();
      lastDataReceived.textContent = now;
    }
  }, 3000);

  setInterval(() => {
    if (state.doorState === "open") {
      state.lastEvent = "Monitoring active";
    }
  }, 1000);
});
