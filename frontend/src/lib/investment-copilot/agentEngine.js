import { sendAnalystMessage, generateLiveSteps, formatCompletedTrace, parseBackendResponse } from "./api";

/* ------------------------------------------------------------------ */
/*  ANALYST CHAT ENGINE — connects frontend to FastAPI backend          */
/* ------------------------------------------------------------------ */

let _sessionCounter = 0;
function newSessionId() {
  return `session-${Date.now()}-${++_sessionCounter}`;
}

const SESSION_ID = newSessionId();

/**
 * askInto — sends user prompt to backend, manages real-time status step transitions,
 * parses backend response into rich Investment Copilot UI component types.
 */
export async function askInto(setFn, text, _key, clearFirst = false) {
  const userId = Date.now() + Math.random();
  const agentId = userId + 1;

  // Generate query-relevant live steps for real-time progress indicator
  const liveSteps = generateLiveSteps(text);

  const userMsg = { id: userId, role: "user", text };
  const loadingMsg = {
    id: agentId,
    role: "agent",
    loading: true,
    liveSteps: liveSteps,
    currentStepIndex: 0,
    completedTrace: [],
    output: null,
    error: null,
  };

  // Add user message & loading placeholder to chat state (clear existing if requested)
  if (clearFirst) {
    setFn([userMsg, loadingMsg]);
  } else {
    setFn((prev) => [...prev, userMsg, loadingMsg]);
  }


  // Start real-time step timer while HTTP request is in progress
  let stepIndex = 0;
  const intervalId = setInterval(() => {
    stepIndex += 1;
    if (stepIndex < liveSteps.length) {
      setFn((prev) =>
        prev.map((m) => (m.id === agentId ? { ...m, currentStepIndex: stepIndex } : m))
      );
    }
  }, 550);

  try {
    // Execute backend research request
    const data = await sendAnalystMessage(text, SESSION_ID);

    clearInterval(intervalId);

    // Format completed trace for summary view
    const completedTrace = formatCompletedTrace(data.trace);

    // Parse response into rich UI component data (memo, comparison, metric, or text)
    const output = parseBackendResponse(data);

    // Update message state once response arrives
    setFn((prev) =>
      prev.map((m) =>
        m.id === agentId
          ? {
            ...m,
            loading: false,
            completedTrace,
            output,
            error: null,
          }
          : m
      )
    );
  } catch (err) {
    clearInterval(intervalId);

    const errorMessage =
      err?.message && !err.message.includes("fetch")
        ? err.message
        : `Could not reach the research service at ${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}. Please verify backend status and CORS settings.`;

    setFn((prev) =>
      prev.map((m) =>
        m.id === agentId
          ? { ...m, loading: false, completedTrace: [], output: null, error: errorMessage }
          : m
      )
    );
  }
}

/* Legacy stubs preserved for call-site compatibility */
export function buildResponse() { return {}; }
export function stepTraceGeneric() { }
export function askMemoFollowUp() { }
export function askManagerFollowUp() { }
export function memoFreeAskInto() { }
