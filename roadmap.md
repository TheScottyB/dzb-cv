# ATS Agent System Roadmap

## Design Principles

### Open Agent SDK Concepts as Applied Here

| Concept       | Meaning in This ATS System                                              |
|---------------|------------------------------------------------------------------------|
| **Agent**     | Specialized stateless worker (e.g., ExtractorAgent, PreprocessorAgent)  |
| **Action**    | Discrete operation by agent (e.g., extract text, detect sections)       |
| **Tool**      | Core reusable function (e.g., extract_text, NER, matching)             |
| **Memory**    | Structured state shared by agents for each resume/document              |
| **Observation** | Result agent receives after tool/action is run                          |
| **Plan**      | Sequence of tasks agent decides or follows (could change dynamically)   |

- Every each step of ATS parsing/matching maps to its own small, stateless agent: extract, preprocess, sectionize, NER, structure, score, match, suggest.
- Core ML and scoring methods are wrapped as SDK-compliant Tool objects.
- Shared memory is a single centralized object per resume/job match containing all processing/subtask results, e.g.:
  ```json
  {
    "resumeId": "abc123",
    "fileName": "resume.pdf",
    "extractedText": "...",
    "preprocessedText": "...",
    "sections": [...],
    "entities": {...},
    "structuredResume": {...},
    "confidenceScore": 0.92,
    "matchAnalysis": {...},
    "improvementSuggestions": [...]
  }
  ```
- Agent/plan logic enables autonomous self-routing (each agent decides next step based on memory)—no brittle wiring or orchestration microservices.

## Status / Progress

- [x] Master blueprint drafted
- [x] Agent stubs/prototype bootstrap operational
- [ ] Roadmap & design principles centralized here
- [ ] Tool scaffolding (extract_text, preprocess_text) ready for implementation
- [ ] Minimal AgentRuntime setup (Extractor, Preprocessor)
- [ ] Incremental agent/tool/memory system buildout

---

## Next Steps

### Stage 1: Tool Wrapping
- [ ] Define and implement `extract_text` and `preprocess_text` as Open Agent SDK Tool objects
- [ ] Start wrapping in-project MLParser and Scorer functions with Tool wrappers

### Stage 2: Minimal Agent Runtime
- [ ] Set up AgentRuntime with two agents (ExtractorAgent and PreprocessorAgent)
- [ ] Implement memory context passing, observations, and agent step-by-step logging

### Stage 3: Incremental Agent Expansion
- [ ] Add SectionizerAgent, EntityExtractorAgent, StructurerAgent, etc.
- [ ] Expand toolset and memory schema accordingly

### Stage 4: Full Orchestration and Planning
- [ ] Enable agent self-routing/self-replanning logic
- [ ] Integrate confidence scoring and job matching tools as agents or tools

### Stage 5: Documentation and Future Directions
- [ ] Complete runtime.yaml and code documentation for Open Agent SDK format
- [ ] Prepare for QAInspectorAgent and SDKChangeMonitorAgent integration

---

## Notes

- Architecture designed to natively leverage Open Agent SDK’s automatic memory passing and dynamic planning
- Clear division between agent roles, tool contracts, and memory schema for maximum testability and extensibility
- “Self-healing” and “minimal assumptions” principles per blueprint: agents log and attempt correction on drift

---

_This document is living and should be updated as agent system stages are completed or design pivots occur._

