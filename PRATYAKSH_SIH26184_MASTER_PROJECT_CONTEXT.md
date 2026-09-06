# PRATYAKSH — SIH26184 Master Project Context

> **Purpose:** This Markdown file is a long-form team handoff for the Smart India Hackathon 2026 software solution. It is designed to be pasted into Claude, Antigravity, Gemini, Copilot, or another coding/research agent so the agent understands the project without needing the original chat.

---

### 📂 Quick Navigation to Developer Specs & Prototype Assets:
* 📄 **Complete Q&A Strategy Guide (Q1–Q15):** [`PRATYAKSH_SIH26184_COMPLETE_QNA_GUIDE.md`](./PRATYAKSH_SIH26184_COMPLETE_QNA_GUIDE.md)
* 🧠 **Developer 1 (AI/ML & FastAPI Backend):** [`DEV1_AI_BACKEND_SPEC.md`](./DEV1_AI_BACKEND_SPEC.md)
* 🎨 **Developer 2 (Frontend Command Center & GIS):** [`DEV2_FRONTEND_GIS_UI_SPEC.md`](./DEV2_FRONTEND_GIS_UI_SPEC.md)
* ⛓️ **Developer 3 (Blockchain & Telegram Patrol Bot):** [`DEV3_BLOCKCHAIN_TELEGRAM_SPEC.md`](./DEV3_BLOCKCHAIN_TELEGRAM_SPEC.md)
* 🚀 **1-Click Demo Launcher:** [`run_pratyaksh.bat`](./run_pratyaksh.bat)
* 📖 **Repository Overview:** [`README.md`](./README.md)

---

## Project Identity

- Problem Statement ID: **SIH26184**
- Ministry: **Ministry of Home Affairs**
- Theme: **Blockchain & Cybersecurity**
- Working product name: **PRATYAKSH**
- Product description: **Predictive Cybercrime Cash-Out Intelligence Platform**
- Target deadline mentioned in planning: **20 September 2026**
- Primary output: **likely future cash-withdrawal locations + likely time window + explanation**
- Primary user: authorized cybercrime investigators / analysts
- Operating mode: decision support, not automated enforcement
- Prototype data policy: synthetic transaction/case data
- Geospatial prototype source: OpenStreetMap ATM/POI data
- Public context sources: MHA/I4C, NCRB/OGD, RBI, NPCI where useful
- Production data model: authorized feeds only

## Master one-line definition

**PRATYAKSH predicts the most likely future ATM cash-out locations for a specific cybercrime complaint, before the cash-out happens, using transaction-graph, spatial, temporal, historical, and baseline evidence, and explains WHERE, WHEN, and WHY while keeping sensitive data off-chain and the human investigator in control.**

## Core narrative

`REPORT → TRACE → UNDERSTAND → PREDICT → EXPLAIN → PRIORITIZE → INTERVENE → LEARN`

## Core question

> Given a reported cybercrime complaint and the currently available authorized financial/transaction trail, which candidate ATM locations are most likely to be associated with a future withdrawal of the reported fraud proceeds, within what time window, and what evidence supports each prediction?

## Critical interpretation

PRATYAKSH is **not** asking:

- Is this ATM fraudulent?
- Is every withdrawal at this ATM suspicious?
- Where is the fraudster's exact live location?
- Who is guilty?

PRATYAKSH **is** asking:

- For this case, what is the most likely next cash-out location?
- When is the cash-out likely to happen?
- Why did the system rank that location highly?
- How confident is the model and how strong is the evidence?
- What happens when the real event arrives?

---

# 1. Exact Problem Understanding

## 1.1 What SIH26184 is fundamentally about

The problem is a predictive analytics problem around cybercrime complaints and likely cash-withdrawal locations.

The word **predictive** is critical.

The system should forecast the likely cash-out **before** the actual ATM withdrawal occurs.

The actual withdrawal becomes an outcome/ground-truth event after it occurs.

Historical cash-outs can be used as reference data and training labels.

The active case prediction must use only information available up to the prediction timestamp.

This means the feature pipeline needs an explicit **time cutoff**.

No future event can leak into the pre-event prediction feature set.

## 1.2 The target event

The target event is a future withdrawal of funds associated with the reported cybercrime complaint.

The target can be represented as:

```text
Y = 1 if a candidate ATM is the actual complaint-associated cash-out location within the prediction horizon
Y = 0 otherwise
```

A more general formulation is:

```text
P(withdrawal associated with complaint C at ATM i within window t
  | current authorized transaction graph,
    spatial context,
    temporal context,
    historical behavior,
    linked-case evidence,
    ATM features,
    normal baseline activity)
```

The production target should be defined with data owners and legal stakeholders.

The prototype target should be explicitly documented as synthetic.

## 1.3 Why complaint conditioning matters

An ATM can be perfectly normal and still be the most likely location for a particular complaint.

An ATM can have heavy normal usage and still be unrelated to the current case.

Therefore the system must condition candidate likelihood on the complaint and its associated financial trail.

This is the most important conceptual defense against the question:

> “How do you know a normal ATM withdrawal is fraudulent?”

Answer:

> “We do not classify an arbitrary ATM withdrawal as fraudulent. We estimate the likelihood that a future withdrawal is associated with a specific reported complaint, conditioned on that complaint's financial trail and supporting temporal and spatial evidence.”

## 1.4 Legal and investigative framing

The output is an investigative hypothesis.

The output is not proof.

The output is not an accusation.

The output is not a guilt score.

The output is not a warrant substitute.

The output is not an automated enforcement command.

The final operational decision remains with authorized personnel.

---

# 2. What PRATYAKSH Is Not

## 2.1 Not a generic fraud detector

Generic fraud detection asks whether a transaction looks anomalous.

PRATYAKSH goes one step further operationally.

It asks where the funds are likely to be cashed out next for a particular complaint.

## 2.2 Not an ATM crime heatmap

An area with many cybercrime reports is not automatically the next cash-out area.

Crime-rate statistics are background priors.

Complaint-specific evidence should dominate generic priors.

## 2.3 Not live suspect tracking

PRATYAKSH predicts cash-out location.

It does not claim to know the exact current physical location of the person involved.

Even an authorized device or telecom signal should be treated as a sourced, confidence-bearing evidence field rather than as an unquestionable location fact.

## 2.4 Not automated enforcement

The system may generate a high-priority alert.

It should not automatically freeze an account, dispatch officers, arrest anyone, or make a legal determination.

## 2.5 Not a replacement for government systems

PRATYAKSH is an intelligence layer.

It should sit alongside existing reporting, coordination, and financial-fraud workflows.

---

# 3. Why PRATYAKSH Has a Strong Problem-Solution Fit

## 3.1 Operational gap

Cyber-fraud response can already support reporting, coordination, and fund-control mechanisms.

The additional question is:

> After the case and financial trail are known, where is the money likely to be cashed out next?

That is the predictive gap PRATYAKSH targets.

## 3.2 Main value proposition

**WHERE + WHEN + WHY**

WHERE = Top-K likely ATM/cash-out locations.

WHEN = predicted time-to-cash-out window.

WHY = the graph, spatial, temporal, historical, and baseline evidence behind the ranking.

## 3.3 Strong judge wording

> We do not try to identify “the fraudulent ATM.” We predict the most likely future cash-out locations for a specific cybercrime complaint, conditioned on its financial trail and historical behavior, and present the result as a ranked investigative hypothesis.

## 3.4 Another strong one-liner

> Instead of waiting for the cash-out, PRATYAKSH forecasts where and when it is likely to happen.

---

# 4. Existing Government Ecosystem Context

## 4.1 National Cyber Crime Reporting Portal (NCRP)

The NCRP is the public cybercrime reporting ecosystem.

The public portal highlights **1930** as the immediate helpline for cyber financial fraud reporting.

PRATYAKSH should not create a parallel citizen reporting workflow.

It should conceptually consume authorized complaint/case signals from the existing ecosystem.

Official portal:

https://www.cybercrime.gov.in/

## 4.2 CFCFRMS

The Citizen Financial Cyber Fraud Reporting and Management System (CFCFRMS) is central to cyber-financial-fraud response and coordination.

Official MHA parliamentary material researched for this project describes bank–CFCFRMS API integration and real-time communication/data updates, including consequent lien-marking workflows.

This is strategically important.

It shows that a machine-to-machine integration model already exists in the ecosystem.

PRATYAKSH therefore fits best as a predictive analytics layer that consumes authorized case/transaction signals and returns intelligence to the authorized workflow.

Do not claim actual private CFCFRMS access unless the team receives it.

## 4.3 I4C

The Indian Cyber Crime Coordination Centre (I4C) provides a national coordination context.

The Cyber Fraud Mitigation Centre (CFMC) involves coordination across major banks, financial intermediaries, payment aggregators, telecom providers, IT intermediaries, and State/UT law-enforcement agencies as described in official government material.

PRATYAKSH's natural role is predictive prioritization in this ecosystem.

## 4.4 Suspect Registry

The Suspect Registry provides a relevant context for identifiers and risk signals shared with banks/financial institutions.

Official MHA material discussed during planning reported that, as of 31 January 2026, more than 23.05 lakh suspect identifiers and 27.37 lakh Layer-1 mule accounts had been shared, with declined transactions worth ₹9,518.91 crore reported.

These figures belong to the government ecosystem.

They are **not** PRATYAKSH results.

Use such numbers only as background/context and cite the official source in formal material.

## 4.5 Samanvaya and Pratibimb

Samanvaya is relevant to law-enforcement coordination, MIS, and interstate linkages.

Pratibimb is relevant to geospatial visualization of criminals and crime infrastructure.

Therefore PRATYAKSH should not claim that mapping or coordination is entirely new.

The specific differentiator is predictive cash-out location intelligence conditioned on the current complaint and financial graph.

## 4.6 2026 SOP / CFCFRMS 2.0 context

Research discussed during planning included a January 2026 SOP for NCRP-CFCFRMS processes and a July 2026 PIB release describing CFCFRMS 2.0.

A July 2026 official release reported more than ₹11,158 crore saved across more than 32.80 lakh complaints as of 30 June 2026.

Again, this is ecosystem context, not PRATYAKSH performance.

For final PPT use, re-check the official release and exact wording before quoting current figures.

---

# 5. Data Strategy

## 5.1 The key data reality

The most valuable input is complaint-linked, transaction-level financial data.

That type of data is restricted and is not normally available as a public dataset.

Therefore the prototype must not pretend otherwise.

The prototype should use:

1. Synthetic transaction-level data.
2. Public aggregate statistics.
3. OpenStreetMap ATM/geospatial data.
4. Synthetic investigation/case links.

Production would use authorized private data sources.

## 5.2 Five data families discussed

### Data family A — NCRP cyber-fraud statistics

Useful for aggregate scale/context.

Not sufficient for complaint-linked ATM labels.

### Data family B — NCRB historical cybercrime/fraud tables

Useful for category and geographic context.

Not sufficient for individual transaction trails.

### Data family C — NCRB/OGD 2023 city-level cybercrime data

Useful for geographic background priors.

Not direct evidence of a current case.

### Data family D — OpenStreetMap India ATM/POI data

Useful for ATM candidate generation and GIS enrichment.

Not authoritative for every ATM.

### Data family E — RBI ATM/POS/Card and fraud statistics

Useful for aggregate ATM/cash-withdrawal/payment-system context.

Not an individual transaction feed.

## 5.3 Public vs private data boundary

Public data can explain the ecosystem.

Private authorized data drives the true complaint-conditioned prediction in production.

Synthetic data demonstrates the production logic in the prototype.

Never collapse those three layers into one statement.

## 5.4 Data-tier design

```text
Tier 1 — Case + transaction signals
Tier 2 — Historical linked cases/network evidence
Tier 3 — ATM/road/POI geospatial data
Tier 4 — Aggregate crime/payment priors
Tier 5 — Optional authorized investigation-derived location evidence
```

---

# 6. RBI Research Relevance

## 6.1 Fraud risk management

RBI Master Directions on Fraud Risk Management, dated 15 July 2024, discuss real-time transaction monitoring, unusual activities, money mule accounts, data analytics, MIS, and timely alerting.

This is highly aligned with the concept of PRATYAKSH as an analytics layer.

Use the official RBI source when quoting these requirements.

## 6.2 Digital payment security

RBI digital payment security controls emphasize secure architecture, encryption, secure APIs, logging, monitoring, threat modeling, secure design, UAT, and security testing.

These are relevant to the security architecture slide.

## 6.3 Non-bank PSO cyber resilience

RBI controls for non-bank payment system operators discuss real-time/near-real-time fraud monitoring, 24x7 response, audit logs, and alerts based on features such as transaction velocity, time context, geolocation, IP origin, behavioral signals, and suspect identifiers.

This reinforces the idea that spatial and temporal signals are operationally meaningful.

## 6.4 Audit-trail relevance

RBI research on audit trails emphasizes detailed traces for sensitive systems, including transaction/time/originator/authorizer context and location/IP/terminal where available.

PRATYAKSH should log prediction ID, case ID, model version, timestamp, data snapshot, officer action, and outcome.

Blockchain strengthens integrity but does not replace secure logging.

## 6.5 RBI ATM statistics limitation

Public RBI Bankwise ATM/POS/Card Statistics provide aggregate data such as debit-card cash withdrawal transaction counts and values.

They do not provide the private complaint-linked event stream required by PRATYAKSH.

Use the data as aggregate context.

---

# 7. NCRB / OGD Research Relevance

## 7.1 Crime in India 2023

Official Open Government Data resources include city-level cybercrime data associated with Crime in India 2023.

This data can support geographic priors.

## 7.2 Important warning

A city with more reported cybercrime does not mean an individual ATM in that city is more likely to be the cash-out location for a current complaint.

NCRB should be treated as a background prior.

## 7.3 Latest published edition context

The MHA parliamentary material researched during planning indicated that the latest published Crime in India edition referenced in that material was 2023.

Check the official source before final PPT publication because publication status can change.

---

# 8. OpenStreetMap Research Relevance

## 8.1 ATM tag

OpenStreetMap commonly represents ATMs using:

```text
amenity=atm
```

Additional fields can include operator, network, brand, reference, and opening hours when mapped.

## 8.2 What OSM is good for

OSM can provide:

- ATM coordinate candidates.
- Roads and transport context.
- Nearby POIs.
- Administrative/geographic enrichment.
- Map visualization.

## 8.3 What OSM cannot guarantee

It may not contain every ATM.

It may contain outdated locations.

It may contain duplicates.

It may contain inconsistent tagging.

Therefore OSM must not be described as authoritative ground truth for all ATMs.

## 8.4 Licensing

OpenStreetMap data is released under the ODbL and requires attribution.

Reference:

https://www.openstreetmap.org/copyright

ATM tagging reference:

https://wiki.openstreetmap.org/wiki/Tag:amenity%3Datm

---

# 9. Location Intelligence

## 9.1 Core principle

The system needs **cash-out location intelligence**, not exact person tracking.

## 9.2 Strongest location evidence for the prototype

1. Previous linked cash withdrawals.
2. Recent financial-activity locations where available in synthetic/authorized data.
3. Recency-weighted historical clusters.
4. Linked historical cases.
5. Current case anchors.
6. Candidate ATM geography.
7. General area priors.

## 9.3 Optional lawful investigation-derived location

Production may use location evidence from authorized investigative systems where lawfully available.

Examples can include prior location evidence, authorized device/location records, or other approved sources.

Do not put such sources in the prototype unless actually available.

## 9.4 KYC address rule

KYC address is an account/customer attribute.

It is not live location.

It may be used only as weak contextual information if legally authorized and justified.

## 9.5 IP geolocation rule

IP geolocation is approximate.

Treat it as a proxy.

Do not present it as exact physical position.

## 9.6 Telecom location rule

Telecom/CDR/cell-site-derived location information is highly sensitive.

Use it only when lawfully authorized and available.

Do not make it a required prototype input.

---

# 10. Spatial Features

## 10.1 Meaning of spatial

Spatial = WHERE.

Spatial features describe geographic relationships.

## 10.2 Candidate spatial features

- Distance to previous linked cash-out locations.
- Distance to recency-weighted centroid.
- Distance to historical clusters.
- Frequency of prior use at the same ATM.
- Frequency of prior use in nearby ATM clusters.
- Candidate inside plausible region.
- Distance to current case anchors.
- Local ATM density.
- Nearby road/transport context.
- City/district cybercrime prior.
- Spatial dispersion of linked activity.
- Mapping/data confidence.

## 10.3 Example

A candidate ATM is 0.8 km from a strong recent cash-out cluster.

That is spatially consistent.

It is not proof of an upcoming withdrawal.

## 10.4 Clustering

Possible algorithms:

- DBSCAN.
- HDBSCAN.
- Geohash/grid clustering.
- Density-based aggregation.

For each historical cluster calculate:

- Count.
- Recency-weighted count.
- Average amount.
- Typical time of day.
- Typical delay after transfer.
- Entity/network linkage strength.

## 10.5 Spatial candidate score intuition

```text
strong recent cluster
        +
close candidate ATM
        +
repeated linked use
        +
current graph consistency
        =
strong spatial evidence
```

---

# 11. Temporal Features

## 11.1 Meaning of temporal

Temporal = WHEN.

## 11.2 Candidate temporal features

- Minutes since suspicious transfer.
- Historical time-to-cash-out.
- Median delay.
- Recent transaction velocity.
- Time-of-day similarity.
- Day-of-week similarity.
- Minutes since complaint.
- Sequence position.
- Recent-event recency.
- Cash-out hazard bucket.

## 11.3 Example

Suppose synthetic historical records show that linked cash-outs often occur 12–25 minutes after funds reach a mule account.

If the current relevant event happens at 14:02, a plausible predicted window could be around 14:15–14:35.

That is an example of temporal reasoning.

Do not hard-code this as a universal law.

## 11.4 Time-to-event modeling

Simple MVP:

```text
0–10 minutes
10–30 minutes
30–60 minutes
60–180 minutes
```

Advanced option:

- Survival model.
- Hazard model.
- Temporal point process.
- Time-to-event gradient boosting.

The advanced model is optional.

---

# 12. Recency Weighting

## 12.1 Why recency matters

Recent behavior often represents the current operating mode better than old behavior.

## 12.2 Exponential decay

```python
w_recency = exp(-lambda * age_days)
```

## 12.3 Half-life form

```python
w_recency = 2 ** (-age_days / half_life)
```

## 12.4 Do not invent lambda

The decay parameter should be tuned on validation data or configured as a documented domain parameter.

It should not be presented as an unquestionable constant.

## 12.5 History score intuition

```text
HistoryScore(candidate) =
    Σ recency_weight(event)
      × similarity(event, candidate)
      × relationship_weight(event)
```

Similarity can include distance, ATM reuse, time-of-day compatibility, and network linkage.

---

# 13. Transaction Graph

## 13.1 Why graph analytics

Money movement is relational.

A table can show transactions.

A graph can expose chains, branches, hubs, and relationships.

## 13.2 Basic nodes

- Victim-linked account/entity.
- Mule account/entity.
- Intermediate account/entity.
- Payment instrument if needed.
- Bank/FI entity.
- ATM.
- Complaint.
- Related case/entity.

## 13.3 Basic edges

- Transfer.
- Payment.
- Withdrawal relation.
- Case linkage.
- Identifier linkage where authorized.

## 13.4 Typical flow

```text
Victim
  ↓
Mule A
  ↓
Mule B
  ↓
Cash-out candidate
```

## 13.5 Branching flow

```text
Victim
   ↓
Mule A
  ↙  ↘
B    C
|     |
ATM1  ATM2
```

The system can score multiple possible branches.

## 13.6 Graph-derived features

- Path length.
- Node degree.
- Betweenness.
- Counterparty count.
- Amount concentration.
- Network overlap.
- Branch count.
- Community membership.
- Cash-out history of graph neighbors.
- Time since last graph event.

## 13.7 Why not only a GNN

A GNN is possible.

A full GNN is not necessary for a strong MVP.

Graph-derived features plus XGBoost are simpler to train, explain, and evaluate.

A GNN can be an advanced extension after the core system is reliable.

---

# 14. Model Architecture

## 14.1 Recommended hybrid architecture

```text
Complaint
   ↓
Current financial trail
   ↓
Transaction graph
   ↓
Historical behavior + spatial clusters
   ↓
Plausible cash-out region
   ↓
ATM candidate generation
   ↓
Temporal filtering
   ↓
Feature engineering
   ↓
XGBoost / LightGBM ranker
   ↓
Probability calibration
   ↓
Top-K ATM candidates
   ↓
Time window + explanation
   ↓
Investigator dashboard
   ↓
Actual outcome
   ↓
Validation + drift monitoring + future training
```

## 14.2 Candidate generation first

Do not rank every ATM in India for every case.

Generate a focused candidate set.

Candidate sources:

- Near historical clusters.
- Near current case anchors.
- Previously used by linked entities.
- Near plausible regions.
- Small prior-based exploration set.

## 14.3 Ranking model

Recommended MVP:

**XGBoost or LightGBM**

Why:

- Strong on structured features.
- Handles non-linear relationships.
- Fast enough for prototype inference.
- Good feature-level explanations.
- Easy to compare with baselines.

## 14.4 Baseline models

Use at least:

- Random ranking.
- Popularity/hotspot ranking.
- Logistic regression.

Then compare the hybrid model.

## 14.5 Optional learning-to-rank

A ranking loss can directly optimize Top-K ordering.

This is attractive because the operational output is an ordered shortlist.

## 14.6 Probability calibration

If the UI shows 72%, the model should be calibrated.

Options:

- Platt scaling.
- Isotonic regression.

Evaluation:

- Brier score.
- Reliability plot.

If calibration is not implemented, call the value a confidence or model score, not a probability.

---

# 15. Candidate Scoring Decomposition

## 15.1 Conceptual function

```text
CandidateScore_i = f(
    graph_association,
    recency_history,
    spatial_consistency,
    temporal_consistency,
    linked_case_evidence,
    area_prior,
    normal_baseline_adjustment
)
```

## 15.2 Risk lift

Useful concept:

```text
RiskLift_i =
    P(ATM_i | complaint context)
    /
    P(ATM_i | baseline activity)
```

This says:

> How much does the complaint context increase the candidate's likelihood above normal background activity?

This concept is more defensible than simply using ATM popularity.

## 15.3 Keep separate layers

Recommended conceptual layers:

1. Entity/account risk.
2. Transaction risk.
3. Complaint association probability.
4. Candidate ATM likelihood.
5. Operational priority.

A single dashboard badge can summarize priority while the backend preserves these distinctions.

---

# 16. Normal Activity vs Fraud Association

## 16.1 Why negative examples matter

The model must see legitimate behavior.

Otherwise it can learn:

> ATM with many withdrawals = suspicious.

That would be a major failure.

## 16.2 Synthetic negative examples

Include:

- Legitimate withdrawals.
- High-volume popular ATMs.
- Wrong but nearby ATMs.
- Historical but stale ATMs.
- High-crime-area ATMs with no current case link.
- Unrelated suspicious withdrawals.
- Strong spatial but weak temporal candidates.
- Strong temporal but weak graph candidates.

## 16.3 Hard negatives

Hard negatives are especially important.

They teach the model to combine features rather than memorize shortcuts.

---

# 17. Location Feature Hierarchy

## 17.1 Level 1 — Previous linked cash withdrawals

Use:

- Same ATM frequency.
- Nearby ATM frequency.
- Recency.
- Distance.
- Amount pattern.
- Time-of-day pattern.

## 17.2 Level 2 — Observed geographic behavior

Use:

- Weighted centroid.
- Cluster dispersion.
- Preferred areas.
- Repeated zones.

## 17.3 Level 3 — Linked historical cases

Use:

- Historical ATM overlap.
- Geographic overlap.
- Network-pattern similarity.

## 17.4 Level 4 — Current transaction-flow context

Use:

- Locations associated with current events.
- Time since recent financial events.
- Channel/ATM network constraints where available.

## 17.5 Level 5 — General priors

Use:

- ATM density.
- City-level cybercrime prior.
- Aggregate cash-withdrawal context.
- OSM road/POI enrichment.

## 17.6 Level 6 — Optional authorized investigation signal

Use with:

- source provenance.
- confidence.
- legal authorization.
- timestamp.

Never treat it as automatically exact.

---

# 18. Candidate ATM Generation

## 18.1 Pipeline

```text
Complaint
→ financial trail
→ plausible region
→ candidate ATM set
→ temporal filter
→ ranking
→ Top-K
```

## 18.2 Candidate generator pseudocode

```python
regions = build_plausible_regions(history, current_anchors)

candidates = query_atms_near_regions(regions)

candidates += previously_used_atms(linked_entities)

candidates += exploration_atms(local_priors)

candidates = deduplicate(candidates)
candidates = filter_invalid_or_low_quality(candidates)

features = build_features(case, candidates)
ranks = ranker.predict_proba(features)
```

## 18.3 Why this improves explainability

The investigator sees a focused set of plausible places.

The system can explicitly say how a location entered the candidate pool.

---

# 19. Time Window Prediction

## 19.1 MVP approach

Use a classification or bucket model.

Example buckets:

```text
0–10 min
10–30 min
30–60 min
60–180 min
```

## 19.2 Advanced approach

Use a survival/hazard model.

The hazard function describes how the instantaneous likelihood of cash-out changes over time.

## 19.3 UI recommendation

Do not show a complicated statistical curve first.

Show:

```text
Predicted cash-out window
14:15 – 14:35
```

Then allow an expandable statistical explanation.

---

# 20. Explainable AI

## 20.1 Required explanation

Every Top-K candidate should answer:

> Why is this location here?

## 20.2 Explanation components

- Graph association.
- Recent history.
- Spatial consistency.
- Temporal consistency.
- Linked case evidence.
- Baseline adjustment.
- Data-quality confidence.

## 20.3 Example reason card

```text
WHY ATM #01 RANKED HIGH

+ Strong recent link to cash-out cluster
+ 0.8 km from recency-weighted activity region
+ Historical cash-out timing matches current window
+ Same linked mule branch previously cashed out nearby
+ Candidate remains above normal-area baseline

This is an investigative hypothesis, not proof.
```

## 20.4 SHAP

SHAP can provide feature-level contributions for XGBoost.

Use SHAP internally.

Present grouped human-readable reasons in the investigator UI.

---

# 21. Evaluation Strategy

## 21.1 Core ranking metrics

- Recall@1.
- Recall@3.
- Recall@5.
- Precision@K.
- NDCG@K.
- MAP where appropriate.

## 21.2 Why Recall@K is important

The operational question is often:

> Did we put the real cash-out location somewhere in the investigator's shortlist?

That maps naturally to Recall@K.

## 21.3 Spatial metrics

- Mean distance error.
- Median distance error.
- Percentage of actual locations inside predicted region.

## 21.4 Temporal metrics

- Time-window hit rate.
- Absolute time-to-cash-out error.
- Interval coverage.

## 21.5 Calibration metrics

- Brier score.
- Reliability curve.

## 21.6 Operational metrics

- Prediction latency.
- Alert latency.
- Candidate-set size.
- Review time.
- False-positive rate.
- Evidence completeness.

## 21.7 Never invent metrics

Do not claim 95%, 98%, or 99% accuracy unless measured.

Synthetic performance is not national deployment performance.

---

# 22. Evaluation Baselines and Ablation

Compare:

```text
Random
Hotspot-only
History-only
Graph-only
Spatial-only
Temporal-only
Full hybrid
```

The purpose is to prove that combining evidence improves ranking.

This is more persuasive than one unexplained model metric.

## 22.1 Example ablation question

What happens when graph features are removed?

What happens when historical location features are removed?

What happens when temporal features are removed?

What happens when baseline adjustment is removed?

This can reveal whether the model is truly multimodal.

---

# 23. Train/Test Leakage Prevention

Fraud networks repeat.

Random row splits can leak the same entity or network pattern into both training and test.

Recommended:

- Time-based split.
- Entity-aware split.
- Network-aware split where possible.

Example:

```text
January–June  → training
July–August   → validation
September     → test
```

This is an example only.

The actual dates depend on the synthetic simulator.

## 23.1 Look-ahead rule

For a prediction generated at time T:

```text
features must come only from events with timestamp <= T
```

The actual cash-out at T+15 minutes cannot be used to produce the prediction at T.

This rule must be tested in code.

---

# 24. Synthetic Data Simulator

## 24.1 Why synthetic data is appropriate for the prototype

Complaint-linked financial records are restricted.

A realistic prototype still needs event-level sequences.

The simulator creates those sequences without exposing real people.

## 24.2 Synthetic entities

- Victims.
- Mule A.
- Mule B.
- Mule C.
- Intermediate nodes.
- ATMs.
- Complaint IDs.
- Synthetic devices/identifiers where needed.

## 24.3 Synthetic events

- Complaint creation.
- Transfer.
- Counterparty transfer.
- Account activation.
- Withdrawal.
- Legitimate withdrawal.
- Unrelated transfer.
- Case linkage.
- Outcome confirmation.

## 24.4 Synthetic scenario families

1. Direct mule cash-out.
2. Two-hop mule path.
3. Three-hop mule path.
4. Split funds.
5. Multiple branches.
6. Repeated ATM usage.
7. ATM substitution.
8. New-ATM behavior.
9. Shared network across complaints.
10. Legitimate high-volume ATM hard-negative scenario.

## 24.5 Synthetic randomness

Use reproducible seeds.

Generate multiple seeds.

Evaluate across seeds.

Record simulator version.

Do not judge the model on one random dataset only.

---

# 25. Synthetic Hard-Negative Design

Create cases where:

- The nearest ATM is wrong.
- The most popular ATM is wrong.
- The old historical ATM is wrong.
- The high-crime-city ATM is wrong.
- The spatially best ATM is wrong because timing is incompatible.
- The temporally best ATM is wrong because graph linkage is weak.
- An unrelated legitimate withdrawal happens soon after a suspicious transfer.
- Two candidates are nearly equally plausible.

The model should be forced to combine evidence.

---

# 26. Suggested Data Schema

## 26.1 Complaint

```text
complaint_id
created_at
channel
fraud_category
reported_amount
status
priority
source_system
pseudonymized_victim_id
```

## 26.2 Entity/account

```text
entity_id
entity_type
institution_id
first_seen_at
kyc_context_available
risk_features
linked_case_count
```

## 26.3 Transaction

```text
transaction_id
timestamp
source_entity_id
destination_entity_id
amount
channel
institution_id
reference_type
complaint_link_id
location_context
device_or_identifier_context
is_synthetic
provenance
```

## 26.4 ATM

```text
atm_id
latitude
longitude
operator
network
brand
area
city
source
source_last_updated
mapping_confidence
open_status
nearby_road_class
nearby_poi_density
```

## 26.5 Outcome

```text
outcome_id
case_id
atm_id
event_time
amount
linked_entity_id
association_label
label_provenance
validation_timestamp
```

## 26.6 Prediction

```text
prediction_id
case_id
prediction_time
model_version
candidate_atm_id
rank
score
calibrated_probability
time_window_start
time_window_end
explanation_payload_hash
data_snapshot_hash
audit_record_id
```

---

# 27. Data Provenance

Every important feature should carry, where practical:

- Source.
- Timestamp.
- Confidence.
- Authorization context.
- Freshness.

This is especially important for location evidence.

Example:

```text
location_source = synthetic_history
location_timestamp = 2026-09-05T13:42:00
location_confidence = high
```

Production source metadata must follow the actual data-sharing contract.

---

# 28. ATM Data Quality

## 28.1 Why ATM data quality matters

A correct model cannot produce a useful prediction if the candidate map is wrong.

## 28.2 Quality fields

- source_name.
- source_timestamp.
- operator_known.
- brand_known.
- coordinate_precision.
- duplicate_probability.
- last_verified.
- active_status_confidence.
- mapping_confidence.

## 28.3 Multi-source validation

If multiple approved geographic sources are available, compare coordinates and status.

If the candidate is uncertain, expose that uncertainty.

Do not silently treat uncertain coordinates as exact.

---

# 29. PostGIS Operations

Useful operations:

- `ST_DWithin` for radius candidate search.
- `ST_Distance` for candidate distance.
- `ST_ClusterDBSCAN` for spatial clustering.
- Point-in-polygon for city/district mapping.
- Nearest-neighbor search.
- Geohash/grid aggregation for heatmaps.

Important GIS rule:

Do not treat latitude/longitude degree differences as meters.

Use appropriate coordinate systems and distance functions.

---

# 30. Map UX

## 30.1 Required map objects

- Current case anchor.
- Historical linked clusters.
- Candidate ATMs.
- Top-1 marker.
- Top-3/Top-5 markers.
- Plausible region.
- Optional radius/uncertainty indicator.

## 30.2 What not to show

Do not show a giant “fraud heatmap of India” as the primary product.

Do not imply a highlighted ATM is guilty.

Do not display exact live-person tracking.

## 30.3 Suggested label

> Candidate locations are probabilistic investigative hypotheses.

---

# 31. Timeline UX

A simple timeline is powerful for judges.

Example:

```text
14:02  Complaint
   |
14:02:10  Suspicious transfer
   |
14:03  Prediction generated
   |
14:15 ───────── 14:35  Predicted cash-out window
   |
14:17  Actual simulated withdrawal
   |
14:18  Validation
```

The important story is that the prediction appears before the actual withdrawal.

---

# 32. Investigator Dashboard

## 32.1 Command center

Show:

- Active cases.
- High-priority predictions.
- Recent prediction updates.
- Outcome validation count.
- System health.
- Map snapshot.

## 32.2 Case page

Show:

- Case ID.
- Fraud category.
- Reported amount.
- Current status.
- Last updated time.
- Graph summary.
- Prediction status.

## 32.3 Graph page/panel

Show:

- Nodes.
- Edges.
- Amounts.
- Timestamps.
- Mule path.
- Candidate cash-out relation.

## 32.4 Prediction page/panel

Show:

- Top-1.
- Top-3.
- Top-5.
- Confidence/probability.
- Time window.
- Map.
- Reasons.
- Evidence quality.

## 32.5 Audit page

Show:

- Prediction ID.
- Model version.
- Timestamp.
- Hash.
- Ledger status.
- Verification result.
- Officer action metadata.

## 32.6 Outcome page

Show:

- Predicted location.
- Actual location.
- Geographic error.
- Predicted window.
- Actual time.
- Validation result.

---

# 33. End-to-End Prototype Demo

The demo should tell a story.

## 33.1 Demo steps

1. Open PRATYAKSH.
2. Load synthetic case.
3. Show complaint.
4. Show victim → Mule A → Mule B path.
5. Show a new transaction event arriving.
6. Click “Predict Cash-Out”.
7. Show plausible region.
8. Show Top-5 ATMs.
9. Show predicted time window.
10. Open “Why?”.
11. Show graph/spatial/temporal reasons.
12. Show operational priority.
13. Simulate actual cash-out.
14. Show outcome validation.
15. Show audit verification.
16. Show feedback state.

## 33.2 Best demo moment

The strongest moment is:

> The system predicts ATM-17 at 14:03, then the simulated withdrawal occurs at ATM-17 at 14:17, and the audit record verifies the prediction snapshot.

This is a synthetic demonstration, not a real case.

---

# 34. Blockchain: Exact Purpose

## 34.1 Core role

Blockchain is an integrity/audit layer.

Blockchain does **not** perform the ML prediction.

Blockchain does **not** replace PostgreSQL.

Blockchain does **not** store all sensitive financial data.

Blockchain does **not** prove the model was correct.

## 34.2 Strong architecture statement

```text
ML engine = intelligence
PostgreSQL/PostGIS = operational data
Graph layer = relational context
React = investigation interface
Permissioned ledger = tamper-evident audit
```

## 34.3 Why blockchain fits the theme

Investigative predictions may need to be reviewed later.

Auditors may ask:

- What did the system predict?
- When did it predict it?
- Which model version was used?
- What data snapshot was used?
- Was the record altered later?
- What action followed?
- What outcome was observed?

A tamper-evident ledger can preserve those integrity claims.

---

# 35. Blockchain: Exact Technical Implementation

## 35.1 Off-chain data

Keep off-chain:

- Victim details.
- Account numbers.
- Full transactions.
- KYC.
- Complaint narrative.
- Exact sensitive location history.
- Feature vectors.
- Large explanation payloads.
- Full prediction objects.

## 35.2 On-chain data

Store minimal metadata such as:

- Prediction ID.
- Pseudonymous case reference.
- Model version.
- Timestamp.
- Prediction hash.
- Data snapshot hash.
- Action hash.
- Outcome hash.

## 35.3 Canonical prediction record

```json
{
  "prediction_id": "PRED-001",
  "case_id": "CASE-127",
  "model_version": "ranker-v0.9",
  "timestamp": "2026-09-05T14:03:10+05:30",
  "top_k": [
    {"atm_id": "ATM-17", "rank": 1, "score": 0.72},
    {"atm_id": "ATM-08", "rank": 2, "score": 0.58}
  ]
}
```

The exact payload is a prototype format.

## 35.4 Hash process

```text
Prediction object
      ↓
Canonical JSON
      ↓
SHA-256
      ↓
prediction_hash
```

## 35.5 Verification

1. Fetch the original off-chain prediction snapshot.
2. Canonicalize it identically.
3. Recompute SHA-256.
4. Compare with ledger hash.
5. Match = committed snapshot integrity preserved.
6. Mismatch = divergence from committed snapshot.

## 35.6 Important limitation

A hash match proves integrity of the committed record.

It does not prove the prediction was correct.

---

# 36. Blockchain Smart Contract / Chaincode

Candidate functions:

```text
createPredictionRecord()
verifyPredictionRecord()
recordOfficerAction()
recordOutcome()
recordModelVersion()
registerDataSnapshot()
```

Each function should have access control.

The ledger should record only the minimum necessary metadata.

## 36.1 Permissioned model

Preferred production candidate:

**Hyperledger Fabric**

Reason:

- Permissioned network model.
- Organizational participation.
- Chaincode/smart-contract model.
- Private-data patterns.
- Suitable conceptual fit for government/consortium governance.

Official documentation:

https://hyperledger-fabric.readthedocs.io/

## 36.2 Prototype alternative

Do not spend the majority of the hackathon building a full production Fabric network.

A prototype can demonstrate the concept with:

```text
Hash chain + verification service
```

A small Fabric test network is useful if the team already knows Fabric.

---

# 37. Strong Blockchain Judge Answer

> We don't use blockchain to predict the crime. We use it to preserve the integrity and auditability of what the predictive system predicted, when it predicted it, which model generated it, and what action followed.

If asked why not put the transaction data on-chain:

> Financial and investigative data should remain in secured off-chain systems. The ledger stores integrity proofs and minimal metadata, which gives us auditability without turning the blockchain into a sensitive-data warehouse.

---

# 38. Technology Stack

## 38.1 Recommended MVP

```text
Frontend: React
Map: Leaflet
Backend: FastAPI
Language: Python
Database: PostgreSQL
Spatial: PostGIS
Graph: NetworkX
Optional graph DB: Neo4j
ML: XGBoost / LightGBM
Calibration: scikit-learn
Explainability: SHAP + reason codes
Containerization: Docker
Audit prototype: SHA-256 hash chain
Production ledger candidate: Hyperledger Fabric
```

## 38.2 Optional advanced components

- Redis.
- Kafka.
- WebSockets.
- Survival model.
- Temporal GNN.
- GraphSAGE.
- GAT.
- Neo4j.
- Fabric test network.

Only add these when they provide measurable value.

---

# 39. Database Architecture

## 39.1 PostgreSQL/PostGIS

Recommended system of record for prototype operational data.

PostGIS supports spatial queries.

## 39.2 Neo4j

Useful when the graph visualization/query requirement becomes large.

Optional for MVP.

## 39.3 NetworkX

Excellent for a prototype because graph features can be computed in Python without another production service.

## 39.4 Minimal architecture choice

For a small team:

```text
PostgreSQL + PostGIS
        +
NetworkX
```

is enough.

Do not add Neo4j merely to make the architecture look advanced.

---

# 40. API Design

## 40.1 Case endpoints

```http
POST /api/cases
POST /api/cases/{case_id}/events
GET  /api/cases/{case_id}
GET  /api/cases/{case_id}/graph
```

## 40.2 Prediction endpoints

```http
POST /api/cases/{case_id}/predict
GET  /api/cases/{case_id}/predictions
GET  /api/predictions/{prediction_id}
POST /api/predictions/{prediction_id}/validate
```

## 40.3 ATM endpoints

```http
GET /api/atms
GET /api/atms/{atm_id}
GET /api/atms/search?lat=...&lon=...
GET /api/cases/{case_id}/candidates
```

## 40.4 Audit endpoints

```http
POST /api/audit/predictions
POST /api/audit/actions
POST /api/audit/outcomes
GET  /api/audit/{record_id}
POST /api/audit/{record_id}/verify
```

---

# 41. Event-Driven Design

## 41.1 Case created

```json
{
  "event_type": "CASE_CREATED",
  "case_id": "CASE-127",
  "event_time": "2026-09-05T14:02:00+05:30",
  "amount": 25000,
  "fraud_category": "SYNTHETIC_DEMO",
  "provenance": "prototype"
}
```

## 41.2 Transaction observed

```json
{
  "event_type": "TRANSACTION_OBSERVED",
  "case_id": "CASE-127",
  "transaction_id": "TX-881",
  "event_time": "2026-09-05T14:02:40+05:30",
  "source_entity": "MULE-A",
  "destination_entity": "MULE-B",
  "amount": 24000
}
```

## 41.3 Cash-out outcome

```json
{
  "event_type": "CASHOUT_OUTCOME",
  "case_id": "CASE-127",
  "atm_id": "ATM-17",
  "event_time": "2026-09-05T14:17:02+05:30",
  "amount": 10000
}
```

---

# 42. Near-Real-Time Flow

Example synthetic timeline:

```text
14:02  complaint arrives
14:02  financial trail loaded
14:03  graph constructed
14:03  prediction generated
14:04  new transaction event arrives
14:04  prediction refreshed
14:15  alert remains active
14:17  simulated cash-out occurs
14:18  prediction validated
Later  outcome used for evaluation/training
```

These timestamps are demonstration values only.

## 42.1 Prediction refresh rule

New relevant events can cause a new prediction.

The old prediction should not be silently overwritten.

A new prediction version should be created.

---

# 43. Prediction Versioning

Every prediction should have:

- prediction_id.
- case_id.
- generation_time.
- model_version.
- feature_schema_version.
- candidate_generator_version.
- calibration_version.
- data_snapshot_hash.
- prediction_hash.

This makes investigations reproducible.

---

# 44. Feedback Loop

```text
Prediction
   ↓
Investigator action
   ↓
Actual withdrawal / no withdrawal
   ↓
Outcome label
   ↓
Validation metrics
   ↓
Drift monitoring
   ↓
Retraining dataset
   ↓
Offline evaluation
   ↓
Approval
   ↓
New model version
```

Do not deploy a model directly from raw feedback.

Feedback should be curated and validated.

---

# 45. Fraudster Adaptation

Fraudsters may change:

- ATM.
- route.
- time.
- mule chain.
- cash-out frequency.
- transaction velocity.

Therefore the model needs drift monitoring.

## 45.1 Monitor

- Feature distribution shift.
- Geographic distribution shift.
- Time-to-cash-out shift.
- Candidate hit-rate shift.
- False-positive rate shift.
- New graph structures.
- Candidate coverage.

## 45.2 Response

- Retrain.
- Recalibrate.
- Update feature logic.
- Update candidate generator.
- Roll back if required.

---

# 46. Responsible AI

## 46.1 Human in the loop

The model is a decision-support layer.

Humans review evidence and decide operational action.

## 46.2 No guilt inference

The output should never be presented as guilt.

## 46.3 Uncertainty

The system must support:

- low confidence.
- multiple plausible locations.
- incomplete data.
- no strong historical evidence.
- unavailable ATM coordinates.

## 46.4 Evidence provenance

A reason must be traceable back to a data source and timestamp where practical.

---

# 47. Bias and Fairness Risks

## 47.1 Geographic bias

Crime statistics may reflect reporting behavior and enforcement intensity.

## 47.2 ATM density bias

Dense urban regions naturally create more candidate opportunities.

## 47.3 Historical investigation bias

Historical records may inherit prior enforcement choices.

## 47.4 Mitigation

Keep generic priors lower-weight than complaint-specific evidence.

Monitor location distributions.

Evaluate performance across geography.

Do not create an unexplained “high-risk neighborhood” label.

---

# 48. Security-by-Design

## 48.1 Core controls

- TLS.
- Encryption at rest.
- RBAC.
- Least privilege.
- Pseudonymization.
- Audit logging.
- Secure APIs.
- Input validation.
- Rate limiting.
- Secrets management.
- Monitoring.
- Backup and recovery.
- Container/dependency scanning.
- Model artifact integrity.

## 48.2 Model security

- Version models.
- Hash model artifacts.
- Record dataset version.
- Record feature schema.
- Protect training pipeline.
- Curate labels.
- Monitor poisoning signals.
- Provide rollback.

## 48.3 Data security

Sensitive data should be separated from public reference data.

A compromise of a public map dataset should not expose financial records.

---

# 49. Threat Model

## 49.1 Attack surfaces

- API gateway.
- Authentication.
- Frontend.
- Prediction service.
- Database.
- Graph store.
- ATM ingestion.
- Training pipeline.
- Audit service.
- Ledger connector.

## 49.2 Threats

- Unauthorized access.
- Data exfiltration.
- Prediction tampering.
- Model poisoning.
- Input manipulation.
- Replay attacks.
- Credential theft.
- Insider misuse.
- Audit-log deletion.
- Map-data poisoning.

## 49.3 Mitigations

- RBAC.
- Strong authentication.
- Input validation.
- Hash verification.
- Secure logging.
- Versioned models.
- Network segmentation.
- Monitoring.
- Least privilege.
- Approval gates for deployment.

---

# 50. Production Integration Concept

```text
NCRP / 1930
     ↓
CFCFRMS / authorized workflow
     ↓
Authorized case + transaction signals
     ↓
PRATYAKSH ingestion/API layer
     ↓
Graph + spatial + temporal feature engine
     ↓
Prediction service
     ↓
LEA dashboard / alert
     ↓
Human investigation
     ↓
Outcome feedback
     ↓
Model monitoring / retraining
```

PRATYAKSH is the analytics layer.

The existing government system remains the system of record where applicable.

---

# 51. Government-Ready API Principles

- Use versioned APIs.
- Use strong authentication.
- Use authorization by role/service.
- Validate schemas.
- Include provenance.
- Use idempotency keys.
- Handle duplicate events.
- Handle late events.
- Use correlation IDs.
- Log metadata safely.
- Do not log raw secrets.
- Support partial data.
- Expose confidence/data-quality flags.
- Keep prediction generation asynchronous when necessary.

---

# 52. Low-Confidence Behavior

If evidence is weak, the system should say so.

Example:

```text
LOW CONFIDENCE

No strong recent historical cash-out pattern found.
Showing five geographically plausible candidates.
Additional evidence may materially change ranking.
```

This is better than manufacturing certainty.

---

# 53. No-Candidate Behavior

If no valid candidates are available:

```text
NO HIGH-QUALITY CANDIDATE ATM FOUND

Reason:
Insufficient geographic evidence and incomplete candidate map coverage.

Recommended next step:
Wait for additional authorized transaction evidence / refresh candidate data.
```

The model should not invent an ATM.

---

# 54. Multiple-Equally-Likely Behavior

When several candidates are close:

```text
MULTIPLE PLAUSIBLE LOCATIONS

ATM-17  0.31
ATM-08  0.29
ATM-22  0.27

No single candidate exceeds the configured confidence threshold.
```

This communicates uncertainty responsibly.

---

# 55. Operational Priority

Operational priority is different from probability.

Possible priority factors:

- predicted likelihood.
- urgency of time window.
- reported amount.
- evidence strength.
- response feasibility.

Conceptual:

```text
Priority = f(
  predicted_likelihood,
  time_urgency,
  reported_amount,
  evidence_strength,
  response_feasibility
)
```

This is a decision-support concept.

It is not a legal rule.

---

# 56. Example Synthetic Case

> This section is fictional and for demonstration only.

Case ID: CASE-127.

Reported amount: ₹25,000.

Complaint time: 14:02.

Current path:

```text
Victim → Mule A → Mule B
```

Mule B has recent synthetic historical cash-out activity near a cluster.

The cluster is geographically consistent with current activity.

The timing pattern is compatible with a short cash-out delay.

PRATYAKSH generates five candidate ATMs.

ATM-17 ranks first.

Predicted window: 14:15–14:35.

A synthetic withdrawal occurs at 14:17.

The system records the outcome.

The original prediction snapshot is hash-verified.

The case now has a prediction validation result.

---

# 57. Suggested Demo Visuals

Use three main visual metaphors:

1. **Graph:** shows money movement.
2. **Map:** shows candidate cash-out locations.
3. **Timeline:** shows prediction before outcome.

The three together explain the product faster than a wall of text.

---

# 58. PPT Design Reference from SIH Finalist Decks

The planning discussion reviewed two finalist-style decks supplied by the team:

- “Vanni” — SIH25246, Team Bits & Bytes.
- “EcoWipe” — SIH25070, Team Niet-SafeSecure.

Useful common structural patterns observed:

- Problem / existing issue.
- Proposed solution.
- UVP / unique value proposition.
- Architecture / workflow.
- Technical approach.
- Tech stack.
- Feasibility and viability.
- Risks/challenges and mitigation.
- Impact and benefits.
- Existing solutions / competitor comparison.
- Prototype/resources/demo.
- Research/references.

Design lesson:

**Keep the deck concise, visual, diagram-led, and easy to understand by looking at it.**

Do not put the entire technical implementation on one slide.

---

# 59. Recommended PPT Slide Blueprint

## Slide 1 — Title

PRATYAKSH.

Predictive Cybercrime Cash-Out Intelligence Platform.

SIH26184.

Ministry of Home Affairs.

Blockchain & Cybersecurity.

## Slide 2 — Problem

Cybercrime funds can move rapidly.

Investigators need actionable intelligence before cash-out.

Show:

```text
Complaint → Money movement → Cash-out risk
```

## Slide 3 — Proposed Solution

Show:

```text
REPORT → TRACE → PREDICT → EXPLAIN → INTERVENE → LEARN
```

## Slide 4 — UVP

Show:

```text
WHERE + WHEN + WHY
```

## Slide 5 — Architecture

Show the end-to-end pipeline.

## Slide 6 — Technical Approach

Show graph + spatial + temporal + XGBoost + calibration + explanation.

## Slide 7 — Blockchain

Show off-chain/on-chain split.

## Slide 8 — Feasibility

Show technology, data, operational integration, scaling.

## Slide 9 — Risks and Mitigation

Restricted data.

False positives.

Drift.

ATM uncertainty.

Sensitive data.

## Slide 10 — Impact

Earlier intervention.

Investigator prioritization.

Explainability.

Auditability.

## Slide 11 — Prototype

Screenshots / live demo sequence.

## Slide 12 — References

Official sources.

---

# 60. Feasibility and Viability Slide Content

## Technical feasibility

Python + FastAPI.

XGBoost/LightGBM.

Graph analytics.

PostgreSQL + PostGIS.

Optional Neo4j.

React + Leaflet.

Docker.

## Data feasibility

MHA/I4C + NCRB + RBI + NPCI context.

OSM ATM data.

Synthetic event simulator.

Prototype prediction.

## Operational feasibility

Existing NCRP/CFCFRMS workflow context.

PRATYAKSH predictive intelligence layer.

LEA dashboard.

Decision support, not automated enforcement.

## Viability

Predict before cash-out.

WHERE + WHEN + WHY.

Earlier intervention.

Prioritized investigation.

Explainable intelligence.

Pilot → District → State → National scaling concept.

API-based.

Modular.

Dockerized.

No specialized hardware required for prototype.

## Bottom line

**FEASIBLE TODAY | INTEGRABLE TOMORROW | SCALABLE NATIONWIDE**

Use this as a pitch line, not as an unqualified deployment guarantee.

---

# 61. Challenges and Mitigation Slide

| Challenge | Mitigation |
|---|---|
| Restricted transaction data | Synthetic simulator + authorized production API concept |
| False positives | Complaint-conditioned association + human review |
| Fraudster adaptation | Drift monitoring + feedback loop |
| ATM uncertainty | Top-K + confidence/data-quality indicators |
| Sensitive data | Encryption + RBAC + pseudonymization + audit |
| Incomplete map data | Multi-source validation |
| Model uncertainty | Calibration + low-confidence state |
| Data leakage | Time cutoff + entity/network-aware validation |

---

# 62. Judge Script — 30 Seconds

> PRATYAKSH is a predictive intelligence layer for cybercrime investigations. When a complaint arrives, we build the authorized financial trail as a transaction graph, combine recent behavior with spatial and temporal patterns, generate plausible ATM candidates, and rank the Top-K locations where the reported funds are likely to be withdrawn next. We then show WHERE, WHEN, and WHY with explainable evidence. When the real withdrawal occurs, we validate the prediction and use the outcome for future model improvement. Blockchain is used only to preserve a tamper-evident audit of the prediction, not to store sensitive financial data.

---

# 63. Judge Script — 10 Seconds

> We predict the next cash-out location for a specific cybercrime complaint before the withdrawal happens, using graph, spatial, temporal, and historical evidence, and we explain every ranked candidate.

---

# 64. Judge FAQ

## Q1. How do you know the withdrawal is fraudulent?

We do not classify an arbitrary withdrawal as fraudulent. We estimate the probability that a future withdrawal is associated with the specific complaint and its financial trail.

## Q2. Where does location data come from?

Prototype ATM coordinates come from OpenStreetMap; transaction and case events are synthetic. Production would use authorized signals.

## Q3. Are you tracking a suspect live?

No. We predict cash-out location, not exact live physical location.

## Q4. Why not just pick the nearest ATM?

Because proximity is only one feature. Graph linkage, recency, historical usage, timing, and baseline activity can change the ranking.

## Q5. Why blockchain?

To make the prediction history tamper-evident and auditable.

## Q6. Why not put transactions on-chain?

Sensitive financial data belongs in secure off-chain storage; the ledger stores integrity proofs and minimal metadata.

## Q7. What if the model is wrong?

We show Top-K candidates, uncertainty, explanations, and human review instead of pretending a single ATM is certain.

## Q8. What if the fraudster changes behavior?

Drift monitoring and outcome feedback support retraining and model version updates.

## Q9. How will you get real transaction data?

The prototype uses synthetic event-level data. Production requires authorized integration.

## Q10. Is this a generic pretrained model?

No. The ranker is trained on project-specific synthetic/authorized data and uses complaint-conditioned graph/spatial/temporal features.

## Q11. Why XGBoost?

It is strong on structured heterogeneous features and practical to explain and deploy quickly.

## Q12. Why not only use NCRB/RBI data?

Those sources are aggregate context, not complaint-linked transaction events.

## Q13. Can investigators see why an ATM ranked first?

Yes. The UI exposes graph, spatial, temporal, historical, and baseline reasons.

## Q14. Can this scale nationally?

The architecture is designed to scale by geographic partitioning, candidate generation, modular services, and authorized APIs; deployment scale would require production validation and governance.

---

# 65. Additional Judge Questions

## What if there is no previous ATM history?

The model can fall back to current graph anchors, spatial priors, temporal signals, and candidate exploration, while reducing confidence.

## What if the ATM is missing from OSM?

The candidate universe is incomplete, so the model should expose map-data confidence and support additional approved data sources in production.

## What if the current case uses a completely new ATM?

The system should allow exploration candidates and generalize through spatial/temporal/graph features rather than relying only on exact ATM reuse.

## What if two ATMs are equally likely?

Return Top-K and show low separation between candidates rather than inventing a single certainty.

## What if the actual cash-out never happens?

The prediction becomes a no-event outcome for validation; thresholds and time-to-event metrics must account for censored/no-event cases in a mature system.

## What if a cash-out occurs at a different location than predicted?

Record the actual location and error. Do not rewrite the old prediction.

## What if new transaction data changes the ranking?

Generate a new prediction version and preserve the prior version for audit.

---

# 66. Prototype Scope

## MUST HAVE

- Synthetic complaint generator.
- Synthetic transaction stream.
- Transaction graph.
- ATM map.
- Candidate generator.
- XGBoost/LightGBM ranker.
- Top-K output.
- Time window.
- Reason cards.
- Map.
- Outcome simulation.
- Prediction validation.
- Hash-based audit verification.

## NICE TO HAVE

- Neo4j.
- WebSockets.
- Survival model.
- SHAP.
- Hyperledger Fabric.
- GNN.
- Multiple cities.
- Advanced alerting.

---

# 67. Suggested Repository Structure

```text
pratyaksh/
├── README.md
├── docs/
│   ├── PROJECT_CONTEXT.md
│   ├── ARCHITECTURE.md
│   ├── DATA_DICTIONARY.md
│   ├── MODEL_CARD.md
│   └── DEMO_SCRIPT.md
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   ├── models/
│   │   ├── services/
│   │   ├── graph/
│   │   ├── geospatial/
│   │   ├── prediction/
│   │   └── audit/
│   └── tests/
├── ml/
│   ├── data_generation/
│   ├── features/
│   ├── training/
│   ├── calibration/
│   ├── evaluation/
│   └── models/
├── frontend/
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── maps/
│       └── graph/
├── data/
│   ├── synthetic/
│   ├── osm/
│   └── public_context/
├── blockchain/
│   ├── canonicalization/
│   ├── hashing/
│   ├── ledger/
│   └── verification/
├── docker/
└── notebooks/
```

---

# 68. End-to-End Pseudocode

```python
def predict_case(case_id):
    case = load_case(case_id)
    events = load_authorized_or_synthetic_events(case_id)

    graph = build_transaction_graph(events)
    history = load_linked_historical_locations(case)
    clusters = cluster_historical_locations(history, recency_weight=True)

    anchors = extract_case_anchors(events)
    regions = build_plausible_regions(clusters, anchors)

    candidates = generate_atm_candidates(
        regions=regions,
        historical_atms=extract_historical_atms(history),
        atm_catalog=load_atm_catalog()
    )

    features = build_candidate_features(
        case=case,
        graph=graph,
        candidates=candidates,
        history=history,
        clusters=clusters
    )

    scores = ranker.predict_proba(features)
    calibrated = calibrator.transform(scores)

    time_windows = predict_cashout_windows(
        case, graph, candidates, history
    )

    explanations = explain_predictions(
        model=ranker,
        features=features,
        candidates=candidates
    )

    results = assemble_top_k(
        candidates,
        calibrated,
        time_windows,
        explanations,
        k=5
    )

    data_hash = sha256(canonicalize_data_snapshot(features))
    prediction_hash = sha256(canonicalize_prediction(results))

    audit_id = write_audit_record(
        case_id=case_id,
        model_version=MODEL_VERSION,
        prediction_hash=prediction_hash,
        data_hash=data_hash
    )

    return results, audit_id
```

---

# 69. Model Card

Every production candidate model should have:

- Model name.
- Model version.
- Training data version.
- Synthetic/public/authorized source description.
- Feature groups.
- Target definition.
- Candidate generation version.
- Ranking algorithm.
- Calibration method.
- Train/test split.
- Evaluation metrics.
- Known limitations.
- Bias risks.
- Deployment scope.
- Human-review requirement.
- Rollback version.

---

# 70. Security and Audit Metadata

Recommended prediction metadata:

```text
prediction_id
case_id
prediction_timestamp
model_version
feature_schema_version
candidate_generator_version
calibration_version
data_snapshot_hash
prediction_snapshot_hash
operator_id/pseudonymous actor ID where policy permits
action_id
outcome_id
verification_status
```

Do not store full PII in audit metadata unless explicitly required and authorized.

---

# 71. AI Coding-Agent Rules

When another AI is asked to modify PRATYAKSH, it must preserve these invariants:

1. The task is complaint-conditioned future cash-out prediction.
2. The prediction happens before cash-out.
3. Top-K ranking is preferred to false single-point certainty.
4. Normal legitimate withdrawals exist in training/evaluation.
5. Historical cash-outs are reference/outcome data, not the active future event.
6. Location is probabilistic.
7. KYC address is not live location.
8. Public statistics are aggregate.
9. OSM is not guaranteed ground truth.
10. Prototype transaction-level data is synthetic.
11. Production access to private systems is an authorized integration assumption.
12. Blockchain is for audit/integrity.
13. Sensitive information remains off-chain.
14. Human investigators remain responsible for action.
15. Do not invent metrics.
16. Do not invent API access.
17. Do not create automated enforcement.
18. Keep explanation visible.
19. Preserve prediction history.
20. Version the model.

---

# 72. Replit / AI Build Prompt

```text
You are building PRATYAKSH, the Smart India Hackathon 2026 solution for SIH26184 under the Ministry of Home Affairs, theme Blockchain & Cybersecurity.

The product is a Predictive Cybercrime Cash-Out Intelligence Platform.

CORE OBJECTIVE
Given a synthetic or authorized cybercrime complaint and its current transaction trail, predict the Top-K ATM locations most likely to be associated with a future withdrawal of the reported fraud proceeds, before the withdrawal occurs.

OUTPUT
WHERE = likely ATM/cash-out location
WHEN = likely time window
WHY = explainable evidence

DO NOT
- Build a generic fraud dashboard.
- Label an ATM as fraudulent.
- Claim exact live suspect location.
- Automate enforcement.
- Use real victim data.
- Connect to private banks/government APIs without authorization.
- Call raw model scores probabilities unless calibrated.

PROTOTYPE
- Synthetic transaction data.
- OSM ATM data.
- React.
- FastAPI.
- PostgreSQL/PostGIS or lightweight local equivalent.
- NetworkX.
- XGBoost/LightGBM.
- Leaflet.
- Hash-based audit.

DEMO
Complaint → graph → new event → candidate generation → Top-K → map → time window → reasons → simulated withdrawal → validation → audit verification.

Make the UI investigator-oriented, desktop-first, visual, and concise.
```

---

# 73. Antigravity / Claude Coding Prompt

```text
Act as a senior ML + backend + frontend engineer.

Before changing code, preserve the PRATYAKSH problem definition.

The exact target is complaint-conditioned future cash-out location prediction.

Every proposed feature must answer at least one of:
1. Does it improve WHERE?
2. Does it improve WHEN?
3. Does it improve WHY?
4. Does it improve audit/security?

For every model change, report:
- Input data.
- Output.
- Feature groups.
- Data provenance.
- Leakage risk.
- Calibration impact.
- Explainability method.
- Evaluation plan.

For every backend change, report:
- API contract.
- Authentication/authorization impact.
- Logging.
- Error handling.
- Data sensitivity.

For every UI change, preserve:
- synthetic-data labeling.
- uncertainty.
- candidate ranking.
- time window.
- reasons.
- human-in-the-loop language.
```

---

# 74. Why Existing Systems Do Not Make PRATYAKSH Redundant

Existing systems can provide:

- reporting.
- financial-fraud workflow.
- coordination.
- suspect identifiers.
- case management.
- mapping.

PRATYAKSH focuses on a narrower prediction question:

> Which cash-out locations are likely next for this specific complaint?

The solution is complementary.

Its value is converting a large evidence space into a prioritized future-location hypothesis.

---

# 75. Impact

## 75.1 Investigator impact

- Smaller search space.
- Faster case triage.
- Location-focused intelligence.
- Explainable evidence.
- Prediction history.

## 75.2 System impact

- More proactive workflow.
- Better reuse of graph/spatial/temporal evidence.
- Feedback-driven model improvement.
- Auditability.

## 75.3 Strategic impact

Potential progression:

```text
Reactive investigation
        ↓
Predictive prioritization
        ↓
Proactive intervention support
```

Do not claim guaranteed crime reduction without evidence.

---

# 76. Scalability

## 76.1 Pilot

One city.

One synthetic scenario set.

One ATM catalog.

## 76.2 District

Partition data geographically.

## 76.3 State

Add multiple administrative regions.

## 76.4 National

Use distributed ingestion, partitioned geography, scalable storage, and approved government integrations.

National production requires security, privacy, performance, governance, and validation beyond the prototype.

---

# 77. Performance Engineering

## 77.1 Candidate reduction

The fastest improvement is reducing the candidate universe.

Do not compare millions of potential locations for each case.

## 77.2 Cache static geography

ATM and road data can be cached when permitted.

## 77.3 Precompute historical clusters

Use periodic jobs to update recency-weighted spatial summaries.

## 77.4 Incremental graph update

Do not rebuild the entire graph when only one event changes.

For the MVP, full rebuilds can be acceptable if the dataset is small.

## 77.5 Async predictions

Prediction generation can run asynchronously while the UI shows status.

---

# 78. Reliability Engineering

The system should handle:

- duplicate events.
- missing events.
- late-arriving events.
- inconsistent timestamps.
- incomplete ATM data.
- broken candidate coordinates.
- model service failure.
- audit service failure.

If the audit service fails, the system should not silently report “verified.”

If the model fails, the dashboard should clearly show an unavailable state.

---

# 79. Observability

Monitor:

- prediction latency.
- feature-generation latency.
- database latency.
- candidate count.
- model error rate.
- audit-verification error.
- API error rate.
- data freshness.
- missing-feature rate.

Use correlation IDs.

Avoid putting sensitive payloads into general application logs.

---

# 80. Data Retention Concept

Retention should be policy-driven.

Avoid retaining sensitive data forever simply because storage is cheap.

The prototype can use a short, documented synthetic-data lifecycle.

Production must follow applicable government/legal requirements.

---

# 81. Access Control Concept

Suggested roles:

```text
INVESTIGATOR
ANALYST
SUPERVISOR
AUDITOR
SYSTEM_ADMIN
MODEL_ADMIN
```

Each role should have a minimum required permission set.

A model administrator should not automatically have access to every victim record.

An auditor may need access to integrity metadata without unrestricted access to raw financial data.

---

# 82. Data-Minimization Checklist

Before adding a new feature ask:

- Is it necessary?
- Is it authorized?
- Is it reliable?
- Does it materially improve prediction?
- Can a less-sensitive proxy work?
- How will it be explained?
- How will it be retained?

If the answer is weak, omit the feature.

---

# 83. Feature Reliability Tiers

## Tier A

Direct case-linked transaction evidence.

## Tier B

Strong historical linked cash-out evidence.

## Tier C

Geospatial behavior.

## Tier D

Aggregate priors.

## Tier E

Weak contextual metadata.

The UI should make it possible to distinguish strong from weak evidence.

---

# 84. Explainability Grouping

Instead of exposing hundreds of model features, group them into:

```text
GRAPH
SPATIAL
TEMPORAL
HISTORY
BASELINE
DATA QUALITY
```

Then show one or two dominant reasons from each relevant group.

---

# 85. Suggested Reason Codes

Possible reason-code IDs:

```text
R01_RECENT_CLUSTER
R02_ATM_HISTORY
R03_GRAPH_PATH
R04_TIME_MATCH
R05_LINKED_CASE
R06_BASELINE_LIFT
R07_CASE_ANCHOR
R08_LOCAL_PRIOR
R09_LOW_MAP_CONFIDENCE
R10_WEAK_HISTORY
```

The reason text should remain human-readable.

---

# 86. Alert Design

Example:

```text
PREDICTIVE CASH-OUT ALERT

Case: CASE-127
Priority: HIGH
Prediction horizon: 60 min

Top candidate: ATM-17
Likelihood/confidence: calibrated value
Window: 14:15–14:35

Reasons:
• recent graph linkage
• historical cash-out cluster
• temporal match
• above-baseline candidate likelihood

Review before action.
```

---

# 87. Investigator Workflow

```text
Open case
  ↓
Review transaction graph
  ↓
Review prediction
  ↓
Review Top-K map
  ↓
Open reasons
  ↓
Choose operational action
  ↓
Record action
  ↓
Wait/observe outcome
  ↓
Validate
```

The system should support the workflow without forcing a specific enforcement action.

---

# 88. Audit Workflow

```text
Prediction generated
        ↓
Canonical snapshot
        ↓
Hash
        ↓
Ledger commit
        ↓
Investigator action
        ↓
Outcome
        ↓
Outcome hash
        ↓
Later verification
```

The audit trail should make reconstruction possible.

---

# 89. Model Governance Workflow

```text
Candidate model
   ↓
Offline validation
   ↓
Calibration check
   ↓
Bias/risk review
   ↓
Security review
   ↓
Approval
   ↓
Deployment
   ↓
Monitoring
   ↓
Rollback / retrain
```

---

# 90. Deployment Modes

## Prototype mode

All case/person/transaction values are synthetic.

## Pilot mode

Authorized limited data.

## Production mode

Fully governed authorized data and government integration.

Do not present prototype mode as pilot or production mode.

---

# 91. Current Technology Recommendation

The simplest credible stack remains:

```text
Python
FastAPI
PostgreSQL/PostGIS
NetworkX
XGBoost
scikit-learn calibration
React
Leaflet
Docker
SHA-256 audit chain
```

Optional:

```text
Neo4j
WebSockets
Survival model
Fabric
GNN
```

The core product should work without the optional technologies.

---

# 92. Why Docker

Docker provides:

- Reproducible environment.
- Easy setup.
- Isolated services.
- Easier demo deployment.
- Consistent Python dependencies.

A single `docker compose up` experience is attractive for a hackathon demo.

---

# 93. Testing Strategy

## Unit tests

- Feature functions.
- Recency weighting.
- Graph calculations.
- Spatial distance.
- Candidate generation.
- Canonicalization.
- Hashing.

## Integration tests

- Case creation.
- Event ingestion.
- Prediction.
- Outcome update.
- Audit verification.

## Scenario tests

- Direct cash-out.
- Multi-hop.
- Split money.
- No history.
- New ATM.
- Multiple candidates.
- No candidates.
- Legitimate hard negative.

---

# 94. Model Unit Tests

Examples:

- Newer evidence receives higher recency weight.
- Impossible future event is not used.
- ATM outside candidate radius is excluded where required.
- Historical ATM reuse affects features only if linked.
- Legitimate unrelated withdrawal does not become positive merely due to time proximity.
- Probability calibration is monotonic where expected.

---

# 95. Data Quality Tests

Check:

- Null timestamps.
- Invalid coordinates.
- Duplicate transactions.
- Duplicate ATM IDs.
- Negative/invalid amounts.
- Unparseable identifiers.
- Impossible transaction sequences.
- Unknown provenance.

Bad data should be rejected or flagged.

---

# 96. Model Training Checklist

Before training:

- Freeze feature schema.
- Freeze target definition.
- Validate time cutoff.
- Check class balance.
- Check missingness.
- Check duplicates.
- Check entity overlap.
- Check network overlap.
- Save simulator seed/version.
- Record dataset hash.

After training:

- Save model.
- Save metrics.
- Save calibration.
- Save feature importance.
- Save model card.

---

# 97. Explainability Checklist

Every prediction should have:

- top feature groups.
- at least one graph explanation where available.
- spatial explanation.
- temporal explanation.
- confidence.
- data-quality indicator.
- model version.

---

# 98. Responsible UI Copy

Prefer:

- “Likely candidate.”
- “Predicted cash-out window.”
- “Investigative hypothesis.”
- “Evidence strength.”
- “Model confidence.”
- “Candidate ranking.”

Avoid:

- “Fraud ATM.”
- “Confirmed criminal.”
- “Fraudster location.”
- “Guaranteed cash-out.”
- “100% accurate.”

---

# 99. Product Name Story

PRATYAKSH is intended to evoke seeing/bringing forward actionable intelligence.

The branding should remain professional.

A tagline can be:

**Predict the Cash-Out. Act Before It Happens.**

Alternative:

**WHERE. WHEN. WHY. Before Cash-Out.**

---

# 100. Project Success Criteria

The project is successful when the demo can show:

1. A complaint exists.
2. A transaction graph exists.
3. New evidence arrives.
4. A pre-event prediction is generated.
5. Top-K ATMs are ranked.
6. A time window is shown.
7. Reasons are visible.
8. Actual outcome is simulated later.
9. Prediction is validated.
10. Audit hash is verified.

If these ten steps work smoothly, the core story is complete.

---

# 101. Research Source Register

## 101.1 MHA Rajya Sabha Question 2161 — 11 March 2026

Official document:

https://www.mha.gov.in/MHA1/Par2017/pdfs/par2026-pdfs/RS11032026/2161.pdf

Relevant research topics:

- CFCFRMS.
- Bank API integration.
- Suspect Registry.
- Samanvaya.
- Pratibimb.
- Cybercrime ecosystem statistics.

## 101.2 MHA Rajya Sabha Question 5124 — March 2026

Relevant topic:

- Bank–CFCFRMS API integration.
- Real-time communication/data updates.
- Lien marking.

Use the official MHA source when available.

## 101.3 PIB / MHA CFCFRMS 2.0 — July 2026

Relevant topic:

- CFCFRMS 2.0.
- Reported savings and complaint counts as of June 2026.

Re-check exact official wording before final presentation.

## 101.4 RBI Fraud Risk Management Directions — July 2024

Relevant topics:

- real-time monitoring.
- unusual activity.
- money mule accounts.
- analytics.
- MIS.
- timely alerts.

Official RBI domain:

https://www.rbi.org.in/

## 101.5 RBI Digital Payment Security Controls

Relevant topics:

- secure architecture.
- encryption.
- logging.
- monitoring.
- secure APIs.
- threat modeling.
- secure development.

Official RBI domain:

https://www.rbi.org.in/

## 101.6 RBI ATM/POS/Card Statistics

Use for aggregate ATM/card withdrawal context.

Official RBI domain:

https://www.rbi.org.in/

## 101.7 RBI Payment System Indicators

Use for payment-system scale and fraud context.

Official RBI domain:

https://www.rbi.org.in/

## 101.8 NCRB/OGD Cybercrime 2023

Official OGD domain:

https://www.data.gov.in/

Relevant datasets include city-wise cybercrime resources associated with Crime in India 2023.

## 101.9 OpenStreetMap ATM data

ATM tagging:

https://wiki.openstreetmap.org/wiki/Tag:amenity%3Datm

License/copyright:

https://www.openstreetmap.org/copyright

## 101.10 Hyperledger Fabric

Official documentation:

https://hyperledger-fabric.readthedocs.io/

---

# 102. Research Literature Themes Discussed

The project research also reviewed literature on:

- Graph neural networks for financial fraud detection.
- Graph learning for anti-money-laundering.
- Explainable AI for fraud detection.
- Continual graph learning and concept drift.
- Spatio-temporal crime prediction.
- Graph-based financial crime detection surveys.

The literature supports graph-based relational modeling and temporal adaptation.

The engineering recommendation remains:

> Use the simplest validated model that meets the operational goal.

Do not add deep learning solely for novelty.

---

# 103. Research-to-Architecture Mapping

| Research idea | PRATYAKSH module |
|---|---|
| Graph financial relations | Transaction Graph Engine |
| Spatio-temporal prediction | Feature Engine |
| XAI | Explanation Service |
| Concept drift | Monitoring Service |
| Geospatial clustering | Candidate Generator |
| Audit trails | Audit Service |
| Permissioned ledger | Blockchain layer |

---

# 104. Privacy-to-Architecture Mapping

| Privacy concern | Design response |
|---|---|
| PII exposure | Pseudonymization |
| Financial data leakage | Encryption + RBAC |
| Immutable sensitive payload | Off-chain storage |
| Audit integrity | Hash + permissioned ledger |
| Over-collection | Feature governance |
| Live-location sensitivity | Optional authorized evidence only |

---

# 105. Security-to-Architecture Mapping

| Risk | Control |
|---|---|
| API abuse | Authentication + rate limiting |
| Unauthorized access | RBAC |
| Data tampering | Hash verification |
| Model tampering | Model artifact hashing/versioning |
| Log deletion | Tamper-evident audit |
| Poisoned labels | Curated feedback |
| Map poisoning | Source validation |
| Secret leakage | Secure secret management |

---

# 106. Production Readiness Ladder

```text
Level 0 — Concept
Level 1 — Synthetic demo
Level 2 — Pilot with authorized sample data
Level 3 — Controlled operational deployment
Level 4 — Multi-region production
Level 5 — National-scale governed deployment
```

The SIH submission is primarily demonstrating Level 1 architecture and a path to higher levels.

---

# 107. Honest Claims Policy

Allowed:

> The prototype demonstrates a complaint-conditioned cash-out prediction workflow using synthetic event-level data.

Allowed:

> The architecture is designed to consume authorized real-time signals in production.

Not allowed:

> We integrated live CFCFRMS APIs.

unless the team actually has such integration.

Not allowed:

> Our model predicts the criminal's exact location.

Not allowed:

> Our system guarantees the next ATM.

Not allowed:

> The model has 98% accuracy.

unless the number is measured and documented.

---

# 108. Team Responsibilities

Possible division:

## ML lead

Synthetic simulator.

Feature engineering.

Ranking model.

Calibration.

Evaluation.

## Backend lead

FastAPI.

PostgreSQL/PostGIS.

Event ingestion.

Prediction service.

Audit service.

## Frontend lead

React.

Case dashboard.

Map.

Graph.

Prediction ranking.

Timeline.

## Security/blockchain lead

Hashing.

Audit record.

RBAC.

Optional Fabric integration.

## PPT/demo lead

Story.

Visuals.

References.

Judge script.

---

# 109. Team Daily Build Order

Day block A:

- Freeze schema.
- Build synthetic generator.
- Load ATM map.

Day block B:

- Graph features.
- Spatial clustering.
- Candidate generator.

Day block C:

- Train baseline.
- Train ranker.
- Evaluate.

Day block D:

- Build API.
- Build dashboard.
- Build map.

Day block E:

- Add explanation.
- Add audit.
- Add outcome validation.

Day block F:

- Run full demo.
- Measure metrics.
- Freeze data/model.
- Prepare PPT.

---

# 110. Demo Freeze Rules

Once the live demo works, freeze:

- Dataset.
- Random seed.
- Model file.
- Model version.
- Frontend build.
- Backend build.
- Demo case ID.
- Timeline.

Avoid changing the demo scenario immediately before judging unless necessary.

---

# 111. Demo Recovery Plan

If live inference fails:

- Have a precomputed prediction snapshot.
- Have a preloaded case.
- Have a local map cache.
- Have an offline screenshot/video.
- Show the architecture and explain the live component.

Do not claim the offline fallback is live.

---

# 112. Model Monitoring Dashboard

Could show:

- Recall@K trend.
- Calibration trend.
- Candidate coverage.
- False-positive trend.
- Geographic error.
- Time-window error.
- Drift alert.

This is optional for the prototype but useful for production storytelling.

---

# 113. Data Lineage

Every prediction should conceptually have a lineage:

```text
Case
 ↓
Input events
 ↓
Feature snapshot
 ↓
Candidate set
 ↓
Model version
 ↓
Prediction
 ↓
Explanation
 ↓
Audit record
 ↓
Outcome
```

This is a powerful governance story.

---

# 114. Case Replay

A valuable advanced feature is case replay.

Take a historical/synthetic case.

Replay events in timestamp order.

At each event:

- generate prediction.
- save candidate ranking.
- compare with eventual outcome.

This can demonstrate that the model really predicts before the event.

---

# 115. Counterfactual Testing

Try changing one factor.

Example:

- Remove historical ATM evidence.
- Replace current transfer time.
- Move one candidate 2 km away.

Observe how ranking changes.

This helps debug model logic and explainability.

---

# 116. Candidate Diversity

Top-K should not always be five ATMs sitting next to each other if the system intends geographic diversity.

Possible future enhancement:

- diversity-aware ranking.
- cluster deduplication.

For MVP, standard top-K ranking is enough.

---

# 117. Candidate Grouping

Candidates can be grouped by:

- ATM.
- ATM cluster.
- neighborhood.
- route corridor.

Showing a high-probability region and its top three ATMs can be more useful than only exact pins.

---

# 118. Route Feasibility

Where reliable road data is available, candidate travel plausibility can be approximated.

Do not infer exact movement speed or route without appropriate evidence.

Use route information as a supporting feature.

---

# 119. Temporal Seasonality

The model can learn:

- morning preference.
- afternoon preference.
- evening preference.
- weekday/weekend differences.

Do not assume these patterns universally.

They should be learned from available historical data.

---

# 120. Amount Features

Possible amount features:

- reported amount.
- current mule balance proxy.
- recent transfer amount.
- cumulative recent incoming amount.
- historical ATM withdrawal amount.
- percentage of incoming funds withdrawn.

These can help identify plausible cash-out patterns.

Avoid using amount alone as evidence of fraud.

---

# 121. Velocity Features

Possible velocity features:

- transactions per 5 minutes.
- transactions per 15 minutes.
- transfers in last hour.
- average transfer interval.
- rapid account turnover.

Velocity should be complaint-conditioned where possible.

---

# 122. Sequence Features

A transaction sequence can be represented as:

```text
Receive → Transfer → Transfer → Withdraw
```

Possible features:

- number of hops.
- inter-hop time.
- number of transfers before cash-out.
- branching count.
- amount retained between hops.

---

# 123. Network Overlap Features

Where authorized historical links exist:

- shared counterparties.
- shared network nodes.
- repeated mule clusters.
- repeated ATM clusters.

Historical network overlap can be a powerful feature.

It must still be treated as evidence, not proof.

---

# 124. Data Freshness

A stale location can reduce prediction quality.

Track:

```text
source_last_updated
feature_last_observed
prediction_generated_at
```

Freshness can become a feature or a warning.

---

# 125. Missing-Data Policy

Missing data should not silently become zero.

Examples:

- unknown operator.
- unknown location history.
- missing time-of-day.
- incomplete graph.

Use explicit missing indicators or model-supported missingness handling.

Show important missingness to investigators.

---

# 126. Outlier Handling

Extreme transactions can distort features.

Possible treatment:

- robust scaling.
- winsorization where appropriate.
- log transforms for skewed amounts.
- model-native handling.

The choice must be documented.

---

# 127. Model Interpretability Hierarchy

Level 1:

Top reason codes.

Level 2:

SHAP contributions.

Level 3:

Graph path evidence.

Level 4:

Raw feature drill-down for analysts.

The UI should start at Level 1.

---

# 128. Alert Threshold Design

Thresholds should be validated.

Do not define arbitrary “0.7 = high” without testing.

Better:

- choose threshold based on desired recall/false-positive tradeoff.
- calibrate.
- review operationally.

---

# 129. Intervention Window Logic

A prediction is more useful when the window is actionable.

Example:

```text
Next 15 minutes
Next 30 minutes
Next 60 minutes
Next 3 hours
```

The horizon should match the data and actual operational process.

---

# 130. Prioritization Example

Candidate A:

- probability 0.55.
- window starts in 5 minutes.

Candidate B:

- probability 0.65.
- window starts in 3 hours.

Operational priority may differ from raw probability.

This is why probability and priority should remain separate concepts.

---

# 131. Model Failure Transparency

Example:

```text
Prediction generated with reduced confidence.
Reason: transaction graph incomplete.
Historical cash-out evidence unavailable.
```

Trust increases when the system states why it is uncertain.

---

# 132. Investigative Evidence Chain

A ranked candidate should be traceable:

```text
Candidate ATM
   ↑
Spatial evidence
   ↑
Historical evidence
   ↑
Current graph
   ↑
Complaint
```

This is the conceptual evidence chain.

---

# 133. No Single Factor Principle

No single feature should be presented as decisive.

A candidate can rise because multiple signals align.

The UI should make that visible.

---

# 134. Candidate Score Reasoning Example

Suppose ATM-17 has:

- strong graph association.
- recent location match.
- strong timing match.
- moderate baseline support.

ATM-08 has:

- weak graph association.
- strong location match.
- strong timing match.
- high normal ATM volume.

The hybrid model may rank ATM-17 higher because complaint-specific evidence dominates generic popularity.

---

# 135. Model Bias Toward Popular ATMs

Watch for the model learning:

```text
popular ATM → positive label
```

Countermeasure:

- include legitimate examples.
- normalize baseline activity.
- include candidate exposure features.
- compare complaint-conditioned vs baseline probability.

---

# 136. Model Bias Toward Nearest ATM

Watch for:

```text
distance alone → prediction
```

Countermeasure:

- hard negative near ATMs.
- graph features.
- temporal mismatch examples.
- learned ranker.

---

# 137. Model Bias Toward Crime Hotspots

Watch for:

```text
high NCRB count → prediction
```

Countermeasure:

- use NCRB as low-level prior.
- evaluate with hotspot-only baseline.
- check whether full model materially outperforms it.

---

# 138. Generalization Test

Hold out one synthetic network completely.

Test whether the model can still rank a plausible ATM from new graph structure.

This is stronger than merely random splitting rows.

---

# 139. New-Entity Cold Start

Test a case with:

- no historical ATM usage.
- no historical cash-out cluster.
- current graph only.

The system should still produce a low-confidence shortlist using current spatial/temporal context and priors.

---

# 140. New-ATM Cold Start

Test an ATM never seen in historical training.

The model should rely on:

- distance.
- local density.
- temporal compatibility.
- graph relation to nearby candidates.
- baseline context.

This tests generalization.

---

# 141. Scenario: ATM Map Missing

If the true ATM is absent from OSM:

- The model cannot rank it.
- This is a map-coverage failure, not necessarily ML failure.

Track this separately in evaluation.

---

# 142. Scenario: Wrong Historical Cluster

A stale historical cluster may be geographically strong but no longer relevant.

Recency weighting should reduce its influence.

---

# 143. Scenario: Fraudster Changes ATM

The candidate generator should include nearby alternatives.

The model should not only repeat the exact historical ATM.

This is a reason to combine historical reuse with spatial similarity.

---

# 144. Scenario: Multiple Complaints Share Network

The same network may appear in several complaints.

Shared network structure can strengthen evidence.

However, each complaint should still receive a case-specific prediction.

---

# 145. Scenario: High-Volume Legitimate ATM

A popular ATM receives many normal withdrawals.

It should not rank high simply because it is popular.

Complaint-specific linkage and baseline adjustment should control the result.

---

# 146. Scenario: Fast Cash-Out

If historical cash-out happens within minutes, the time window should adapt.

Do not use a fixed universal delay.

---

# 147. Scenario: Slow Cash-Out

If historical cash-out is delayed for hours, the prediction horizon should reflect that distribution.

The model should be able to express broader uncertainty.

---

# 148. Scenario: No Cash-Out

A case may never produce an observed cash-out.

Mature evaluation needs to handle no-event cases correctly.

Do not force a false positive label.

---

# 149. Scenario: Multiple Cash-Outs

One complaint may lead to multiple withdrawals.

The system can model:

- first cash-out.
- next cash-out.
- cumulative cash-out.

For the MVP, first/next cash-out is easier.

---

# 150. Scenario: Partial Cash-Out

Only part of the reported amount may be withdrawn.

Outcome labels should define what counts as a cash-out associated with the complaint.

---

# 151. Scenario: Funds Split Across Accounts

The transaction graph may branch.

Candidate ranking should be computed per relevant branch or aggregated at case level.

The data model needs to make this explicit.

---

# 152. Scenario: Multiple Candidate Clusters

If two historical clusters are plausible, preserve both.

Do not collapse them prematurely into one centroid.

A candidate can be close to either cluster.

---

# 153. Plausible Cash-Out Region

A region is a probabilistic spatial area containing likely future cash-out candidates.

Possible representations:

- circle/radius.
- polygon.
- cluster convex hull.
- density contour.
- geohash cells.

MVP can use a radius or cluster cells.

---

# 154. Region vs Exact Point

Region-based reasoning is safer when evidence is uncertain.

The UI can show:

```text
Likely region
     ↓
Top candidate ATMs
```

rather than implying exact certainty.

---

# 155. Data Source Priority

A practical evidence priority is:

1. complaint-linked current financial evidence.
2. strong linked historical evidence.
3. recent geographic behavior.
4. current case spatial anchors.
5. general aggregate priors.

This is a conceptual hierarchy, not a hard-coded legal rule.

---

# 156. Feature Governance

Every production feature should have a short document:

```text
Feature name
Definition
Source
Refresh frequency
Sensitivity
Legal/operational basis
Expected direction/interpretation
Known limitations
```

---

# 157. Model Governance

Every production candidate model should have:

- owner.
- version.
- approval date.
- training data version.
- evaluation report.
- known limitations.
- rollback target.

---

# 158. Audit Governance

The audit system should distinguish:

- prediction generated.
- prediction viewed.
- prediction exported.
- action recorded.
- outcome recorded.
- verification performed.

---

# 159. Exported Evidence Package

An investigator may eventually need to export a case summary.

The package can include:

- Case ID.
- Prediction ID.
- Top-K candidates.
- Prediction timestamp.
- Model version.
- Evidence reasons.
- Outcome.
- Audit verification result.

Sensitive exports require authorization.

---

# 160. Evidence Package Integrity

Hash the exported evidence package.

Record the hash in the audit system.

This extends the same integrity concept beyond the prediction snapshot.

---

# 161. Model Version Example

```text
pratyaksh-ranker-v0.1
pratyaksh-ranker-v0.2
pratyaksh-ranker-v1.0
```

Calibration can be versioned separately.

Feature schema can be versioned separately.

---

# 162. Configuration Versioning

Store:

- candidate radius.
- top-K.
- confidence thresholds.
- recency half-life.
- time horizons.
- mapping-quality thresholds.

Configuration changes can affect predictions.

Therefore configuration should be versioned/auditable.

---

# 163. Reproducibility

A prediction should be reproducible from:

```text
case snapshot
+ data snapshot
+ feature code version
+ model version
+ calibration version
+ configuration version
```

This is a major auditability advantage.

---

# 164. Why Prediction History Matters

A new transaction can change the predicted candidate.

Without history, an auditor may ask:

> What did the system originally say?

Preserving versions answers this.

---

# 165. Prediction Comparison View

Optional UI:

```text
Prediction v1 — 14:03
ATM-17 rank 1
ATM-08 rank 2

Prediction v2 — 14:04
ATM-08 rank 1
ATM-17 rank 2

Reason for change:
New transaction event altered graph association.
```

This is a strong advanced demonstration.

---

# 166. Model Explainability vs Human Explainability

A technically correct SHAP plot may still be difficult for investigators.

Therefore:

```text
Model explanation
        ↓
Human-readable reason code
```

The second is the actual product requirement.

---

# 167. Graph Visualization Principle

Show only the relevant graph neighborhood.

Avoid drawing thousands of nodes.

The investigator should see:

```text
Victim → Mule A → Mule B → candidate cash-out context
```

Then allow drill-down.

---

# 168. Graph Layout Principle

Use time ordering when helpful.

Money flow is easier to understand when edges follow left-to-right chronology.

---

# 169. Map Interaction Principle

Clicking a candidate ATM should update the right-side detail panel.

The panel should show:

- rank.
- probability/confidence.
- time window.
- reasons.
- source confidence.

---

# 170. Timeline Interaction Principle

Selecting a time point should highlight the corresponding graph event.

This creates a linked graph-map-timeline experience.

---

# 171. Case Summary Card

Recommended:

```text
CASE-127
Reported: ₹25,000
Status: Predictive monitoring
Latest event: 14:02:40
Prediction: ACTIVE
Top candidate: ATM-17
Window: 14:15–14:35
Priority: HIGH
```

---

# 172. Candidate Card

```text
#1 ATM-17
Confidence: 0.72
Window: 14:15–14:35
Distance to recent cluster: 0.8 km
Graph association: Strong
Historical pattern: Strong
Baseline lift: Positive
```

The values are demo placeholders unless experimentally measured.

---

# 173. Audit Card

```text
Prediction ID: PRED-001
Model: ranker-v0.9
Generated: 14:03:10
Prediction hash: abc123...
Ledger: COMMITTED
Verification: PASSED
```

---

# 174. Synthetic Data Banner

Every prototype screen that uses synthetic case data should display:

> **SYNTHETIC DEMO DATA — NOT A REAL INVESTIGATION**

This avoids confusion.

---

# 175. Demo Data Ethics

Never create fake records that resemble a real person's full identity.

Use fictional IDs.

Use fictional coordinates or public map geometry with synthetic events.

Avoid real bank-account-like sensitive identifiers.

---

# 176. Map Data Ethics

Using real publicly mapped ATM points for a software demonstration is different from exposing private transaction history.

Keep transaction/case data synthetic.

Apply OSM attribution.

---

# 177. Current Research Figures — Presentation Rule

Government statistics can change.

Before the final PPT:

1. Re-open the official source.
2. Check date.
3. Check unit.
4. Check whether the figure is cumulative or period-specific.
5. Cite the exact source.

Never copy a number into the PPT from an old screenshot without verification.

---

# 178. MHA Statistics Context

During research, one official MHA answer reported more than ₹8,690 crore saved across more than 24.65 lakh complaints as of 31 January 2026.

A later July 2026 PIB release referenced more than ₹11,158 crore saved across more than 32.80 lakh complaints as of 30 June 2026.

These are time-specific ecosystem figures.

Use only the latest verified official figure in the final presentation.

---

# 179. MHA Suspect Registry Context

Research discussed more than 23.05 lakh suspect identifiers and 27.37 lakh Layer-1 mule accounts shared as of 31 January 2026.

This shows the scale of the broader cyber-fraud intelligence ecosystem.

It does not measure PRATYAKSH's performance.

---

# 180. NCRP 1930 Context

1930 is the public immediate reporting helpline for cyber financial fraud.

The product can explain the operational sequence as:

```text
Citizen reports
   ↓
Existing government workflow
   ↓
PRATYAKSH predictive layer
```

---

# 181. Research Caveat

Public sources can support architectural reasoning.

They cannot substitute for authorized production data.

This distinction should appear explicitly in the methodology slide or notes.

---

# 182. Production Data Access Statement

Recommended wording:

> Prototype training and transaction simulation use synthetic event-level data because complaint-linked financial records are restricted. Production deployment would consume only lawfully authorized case, transaction, and investigation signals through approved integration interfaces.

---

# 183. Why Synthetic Data Is Not a Weakness

Synthetic data lets the team:

- control ground truth.
- generate hard negatives.
- test edge cases.
- reproduce scenarios.
- demonstrate pre-event prediction.

The key is to be honest about what it proves.

It proves the architecture and methodology can operate in a controlled environment.

It does not prove national deployment accuracy.

---

# 184. Prototype Data Calibration

Synthetic distributions should be informed by public aggregate context where possible.

Examples:

- plausible ATM density.
- transaction amount ranges.
- time-of-day distributions.
- complaint category proportions.
- cash-withdrawal context.

Do not claim synthetic distributions exactly reproduce India.

Call them **calibrated prototype assumptions**.

---

# 185. Synthetic Simulator Parameters

Possible configurable parameters:

```text
num_cases
num_entities
num_mules
mean_hop_count
cashout_delay_distribution
atm_selection_bias
legitimate_withdrawal_rate
network_branch_probability
historical_reuse_probability
fraudster_adaptation_probability
missing_data_rate
```

Version these parameters.

---

# 186. Synthetic Scenario Reproducibility

A scenario should be reproducible from:

```text
simulator_version
seed
parameter_config
scenario_id
```

---

# 187. Scenario IDs

Examples:

```text
SYN_DIRECT_01
SYN_MULTIHOP_02
SYN_SPLIT_03
SYN_HARDNEG_04
SYN_COLDSTART_05
SYN_DRIFT_06
```

This makes test reports easier to interpret.

---

# 188. Evaluation Report Format

```text
Model: ranker-v0.9
Dataset: synthetic-v3
Seed: 42

Recall@1:
Recall@3:
Recall@5:
NDCG@5:
Median spatial error:
Time-window hit rate:
Brier score:
False-positive rate:
Median inference latency:
```

Fill only with measured values.

---

# 189. Baseline Report Format

```text
Random
Hotspot-only
History-only
Graph-only
Spatial-only
Temporal-only
Hybrid
```

Show comparative results.

---

# 190. Model Acceptance Criteria

A candidate model should not be accepted only because it beats one metric.

Consider:

- Top-K retrieval.
- calibration.
- false positives.
- spatial error.
- temporal performance.
- robustness across scenario families.

---

# 191. Data Drift Acceptance Criteria

Define when drift becomes operationally significant.

Examples:

- distribution shift beyond threshold.
- sustained Recall@K decline.
- sustained calibration degradation.

Exact thresholds should be determined experimentally.

---

# 192. Human Review Acceptance Criteria

A high-confidence alert can still require manual review.

The product should not remove that control.

---

# 193. Security Review Acceptance Criteria

Before deployment:

- dependency scan.
- API security test.
- auth review.
- access-control test.
- log leakage review.
- model artifact integrity test.
- audit verification test.

---

# 194. Blockchain Review Acceptance Criteria

Ensure:

- canonicalization deterministic.
- hash reproducible.
- access controls enforced.
- private data not stored on-chain.
- verification endpoint works.
- historical records remain auditable.

---

# 195. Presentation Accuracy Rules

Every number in the deck should be labeled as one of:

- official ecosystem statistic.
- prototype measurement.
- illustrative example.
- target/design goal.

This avoids accidental misrepresentation.

---

# 196. Presentation Language Rules

Prefer:

> can support

> designed to consume

> prototype demonstrates

> probabilistic hypothesis

> authorized data source

> candidate ranking

Avoid overclaiming:

> guarantees

> detects every fraud

> exact location

> zero false positives

> nationwide live integration

---

# 197. Existing-Solution Comparison Guidance

Compare capabilities, not reputations.

Useful axes:

- complaint reporting.
- financial-fraud management.
- transaction monitoring.
- graph analysis.
- predictive cash-out location.
- Top-K ranking.
- time-window prediction.
- explanation.
- audit integrity.

Use “PRATYAKSH focuses on…” rather than “existing systems cannot…”.

---

# 198. UVP Slide Wording

```text
FROM CASE TO CASH-OUT INTELLIGENCE

Complaint-conditioned
Graph-aware
Spatio-temporal
Explainable
Auditable

WHERE + WHEN + WHY
```

---

# 199. Architecture Slide Wording

```text
CASE DATA
   ↓
TRANSACTION GRAPH
   ↓
SPATIAL + TEMPORAL FEATURES
   ↓
CANDIDATE GENERATION
   ↓
ML RANKING
   ↓
CALIBRATION
   ↓
TOP-K + TIME WINDOW
   ↓
EXPLAIN
   ↓
LEA DASHBOARD
   ↓
AUDIT + FEEDBACK
```

---

# 200. Final Project Mantra

**Predict before cash-out.**

**Condition on the complaint.**

**Use graph + space + time.**

**Rank Top-K, do not pretend certainty.**

**Explain WHERE, WHEN, WHY.**

**Keep sensitive data off-chain.**

**Use blockchain for integrity.**

**Keep a human in the loop.**

**Validate outcomes.**

**Monitor drift.**

**Never invent data access.**

**Never invent performance.**

---

# 201. Final Non-Negotiables

- The system predicts **before** cash-out.
- The prediction is **complaint-conditioned**.
- The target is a **future withdrawal location/event**.
- Normal legitimate withdrawals must appear in training/evaluation.
- Historical cash-outs are reference/training/outcome signals, not the future event being predicted.
- Location is **probabilistic**.
- KYC address is not live location.
- Public NCRB/RBI/NCRP data is aggregate context.
- OSM is geospatial enrichment, not guaranteed ground truth.
- Prototype transaction data is synthetic.
- Production private data is an authorized-integration assumption.
- XGBoost/LightGBM is the recommended MVP ranker.
- Graph analytics are core.
- Spatial means WHERE.
- Temporal means WHEN.
- Explainability means WHY.
- Top-K is preferred to false single-point certainty.
- Scores are not probabilities unless calibrated.
- Blockchain is for integrity/audit.
- Sensitive data stays off-chain.
- Permissioned ledger is preferred for production architecture.
- Human investigators remain responsible for action.
- Actual outcomes feed evaluation and future training.
- No invented accuracy numbers.
- No invented government API access.
- No automated enforcement.
- No public sensitive data.

---

# 202. Final Handoff Checklist

- [ ] Freeze project definition.
- [ ] Build synthetic data simulator.
- [ ] Build ATM catalog.
- [ ] Build graph.
- [ ] Build spatial clusters.
- [ ] Build candidate generator.
- [ ] Build temporal features.
- [ ] Build baseline features.
- [ ] Train logistic baseline.
- [ ] Train XGBoost/LightGBM.
- [ ] Calibrate scores.
- [ ] Evaluate Recall@1/@3/@5.
- [ ] Evaluate NDCG/MAP.
- [ ] Evaluate spatial error.
- [ ] Evaluate time-window accuracy.
- [ ] Evaluate calibration.
- [ ] Build explanations.
- [ ] Build map.
- [ ] Build graph UI.
- [ ] Build timeline UI.
- [ ] Build case dashboard.
- [ ] Build outcome validation.
- [ ] Build audit hash.
- [ ] Build verification.
- [ ] Version model.
- [ ] Version data.
- [ ] Version configuration.
- [ ] Run leakage tests.
- [ ] Run hard-negative tests.
- [ ] Run cold-start tests.
- [ ] Run map-missing tests.
- [ ] Run end-to-end demo.
- [ ] Freeze demo scenario.
- [ ] Verify every PPT statistic against official source.
- [ ] Add OSM attribution.
- [ ] Prepare judge answers.

---

# 203. Quick Reference for the Whole Team

## Problem

Predict likely future cash-out locations for a specific cybercrime complaint.

## Input

Current authorized/synthetic complaint + transaction trail + history + geography + time context.

## Intelligence engine

Transaction graph + spatial/temporal features + XGBoost/LightGBM.

## Output

Top-K candidate ATMs + predicted time window + reasons + confidence/evidence quality.

## Security

Encryption + RBAC + provenance + audit.

## Blockchain

Hash prediction snapshots and actions; store only minimal metadata on a permissioned ledger.

## Prototype data

Synthetic transaction events + public aggregate context + OSM ATM/geospatial data.

## Production data

Authorized case/transaction/investigative signals only.

## Human role

Review and decide operational action.

## Feedback

Validate predicted vs actual outcome and monitor drift.

## Core message

**Predict before cash-out.**

---

# 204. Final AI Context Instruction

When this document is pasted into another AI assistant, that assistant should treat the following as the project's canonical constraints unless the team explicitly changes them:

1. PRATYAKSH is the working product name.
2. The problem is SIH26184.
3. The ministry is Ministry of Home Affairs.
4. The theme is Blockchain & Cybersecurity.
5. The target is future cash-withdrawal location associated with a specific cybercrime complaint.
6. The forecast must happen before the withdrawal.
7. The result is Top-K and probabilistic.
8. The model must account for legitimate normal withdrawals.
9. The core features are graph, spatial, temporal, historical, and baseline.
10. XGBoost/LightGBM is the preferred MVP ranker.
11. Calibration is required before calling scores probabilities.
12. Explainability is mandatory.
13. Public data is aggregate context.
14. Prototype event-level data is synthetic.
15. OSM is a geospatial candidate source, not guaranteed ground truth.
16. Production private data requires authorization.
17. Location is not live suspect tracking.
18. KYC address is not live location.
19. Human investigators remain in control.
20. Blockchain is an audit/integrity layer.
21. Sensitive data stays off-chain.
22. Permissioned blockchain is the production concept.
23. Outcome feedback is used for evaluation and retraining.
24. Drift monitoring is required.
25. No fabricated metrics.
26. No fabricated government integrations.
27. No automated enforcement.
28. The product narrative is WHERE + WHEN + WHY.
29. The overall story is REPORT → TRACE → UNDERSTAND → PREDICT → EXPLAIN → PRIORITIZE → INTERVENE → LEARN.
30. The prototype should be visually simple, technically credible, and judge-friendly.

---

# 205. Closing

PRATYAKSH should be understood as a **predictive intelligence layer for the cash-out stage of cybercrime investigations**.

The product does not compete with the entire cybercrime ecosystem.

It focuses on one high-value operational question:

> **Given what we know right now about this complaint and its financial trail, where is the money most likely to be withdrawn next, when is that likely to happen, and why?**

Everything in the architecture should support that question.

Everything in the ML pipeline should be measurable against that question.

Everything in the UI should make that question easier for an investigator to answer.

Everything in the security design should protect the evidence used to answer that question.

Everything in the blockchain layer should make the prediction history auditable.

Everything in the feedback loop should make the system better over time.

The strongest product statement remains:

> **PRATYAKSH predicts WHERE the cash-out is likely to happen, WHEN it is likely to happen, and WHY—before the cash-out happens.**

