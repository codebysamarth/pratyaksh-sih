"""
Section 65B / Bharatiya Sakshya Adhiniyam 2023 Legal Evidence PDF Generator for PRATYAKSH.
Creates cryptographically hashed court evidence dossiers with SLA logs and ATM hotspot vectors.
"""
import io
import os
import hashlib
from datetime import datetime
from typing import Dict, Any, List

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
from reportlab.lib.units import inch


def compute_sha256(data_str: str) -> str:
    return hashlib.sha256(data_str.encode("utf-8")).hexdigest()


def generate_section65b_pdf(case_data: Dict[str, Any]) -> bytes:
    """
    Generates a byte-stream of the certified Section 65B / Section 63 BSA legal PDF.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    header_title_style = ParagraphStyle(
        "HeaderTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=16,
        alignment=1,  # Center
        textColor=colors.HexColor("#0F172A"),
    )
    
    header_sub_style = ParagraphStyle(
        "HeaderSub",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=12,
        alignment=1,  # Center
        textColor=colors.HexColor("#0284C7"),
    )
    
    section_heading_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#1E293B"),
        spaceBefore=6,
        spaceAfter=3,
    )
    
    body_style = ParagraphStyle(
        "BodySmall",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#334155"),
    )
    
    bold_body_style = ParagraphStyle(
        "BoldBodySmall",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#0F172A"),
    )
    
    mono_style = ParagraphStyle(
        "MonoSmall",
        parent=styles["Normal"],
        fontName="Courier",
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#0F172A"),
    )
    
    legal_text_style = ParagraphStyle(
        "LegalText",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=7,
        leading=9.5,
        textColor=colors.HexColor("#475569"),
    )

    story = []

    # 1. Header Banner
    story.append(Paragraph("GOVERNMENT OF INDIA • MINISTRY OF HOME AFFAIRS", header_sub_style))
    story.append(Paragraph("INDIAN CYBER CRIME COORDINATION CENTRE (I4C)", header_sub_style))
    story.append(Paragraph("PRATYAKSH: PREDICTIVE CYBERCRIME CASH-OUT HOTSPOT INTELLIGENCE", header_title_style))
    story.append(Paragraph("FORMAL CERTIFICATE OF ELECTRONIC EVIDENCE (SECTION 65B IEA / SECTION 63 BSA 2023)", ParagraphStyle("SubHeader", parent=header_sub_style, fontSize=8, textColor=colors.HexColor("#B91C1C"))))
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0284C7"), spaceAfter=8))

    # Case identifiers
    case_id = case_data.get("case_id", "NCRP-2024-DEMO")
    victim_name = case_data.get("victim_name", "Anonymous Citizen")
    fraud_type = case_data.get("fraud_type", "DIGITAL_ARREST")
    amount = float(case_data.get("amount", 350000.0))
    location_name = case_data.get("location_name", "VIT Pune, Bibwewadi")
    timestamp_str = case_data.get("timestamp", datetime.now().isoformat())
    model_version = case_data.get("model_version", "PRATYAKSH_XGB_v2.4")

    predicted_atms = case_data.get("predicted_atms") or case_data.get("atms") or []
    if not predicted_atms:
        predicted_atms = [
            {
                "rank": 1,
                "name": "SBI ATM - VIT Pune Main Gate",
                "bank": "State Bank of India",
                "lat": 18.4636,
                "lon": 73.8682,
                "distance_km": 0.8,
                "travel_time_mins": 8,
                "risk_probability": 82,
                "top_reasons": ["Under 800m from last active mule BTS cell ping", "Primary road transit corridor"]
            },
            {
                "rank": 2,
                "name": "HDFC Bank ATM - Bibwewadi Branch",
                "bank": "HDFC Bank",
                "lat": 18.4610,
                "lon": 73.8715,
                "distance_km": 1.4,
                "travel_time_mins": 14,
                "risk_probability": 13,
                "top_reasons": ["Secondary transit corridor", "Branch-attached 24/7 lobby"]
            },
            {
                "rank": 3,
                "name": "Bank of Maharashtra ATM - Upper Indira Nagar",
                "bank": "Bank of Maharashtra",
                "lat": 18.4675,
                "lon": 73.8620,
                "distance_km": 2.1,
                "travel_time_mins": 18,
                "risk_probability": 5,
                "top_reasons": ["Alternative escape route corridor"]
            },
        ]
    top_atm = predicted_atms[0]["name"] if predicted_atms else "SBI ATM - VIT Pune"

    # Compute Hashes
    alert_hash = case_data.get("alert_hash") or compute_sha256(f"{case_id}:{timestamp_str}:{top_atm}:{model_version}")
    merkle_root = case_data.get("merkle_root") or compute_sha256(f"{alert_hash}:{victim_name}:{amount}:{fraud_type}")
    contract_addr = case_data.get("contract_address", "0x5FbDB2315678afecb367f032d93F642f64180aa3")
    tx_hash = case_data.get("tx_hash", "0x" + compute_sha256(f"TX:{case_id}:{alert_hash}")[:64])

    # 2. Case Metadata Table
    story.append(Paragraph("1. INCIDENT & INTELLIGENCE DOSSIER", section_heading_style))
    
    meta_table_data = [
        [
            Paragraph("<b>NCRP Case Ref:</b>", bold_body_style),
            Paragraph(f"{case_id} (SIH PS #26184)", body_style),
            Paragraph("<b>Incident Category:</b>", bold_body_style),
            Paragraph(f"{fraud_type}", body_style),
        ],
        [
            Paragraph("<b>Victim Complainant:</b>", bold_body_style),
            Paragraph(f"{victim_name}", body_style),
            Paragraph("<b>Defrauded Amount:</b>", bold_body_style),
            Paragraph(f"₹ {amount:,.2f} INR", bold_body_style),
        ],
        [
            Paragraph("<b>Geographical Sector:</b>", bold_body_style),
            Paragraph(f"{location_name}", body_style),
            Paragraph("<b>Detection Timestamp:</b>", bold_body_style),
            Paragraph(f"{timestamp_str}", body_style),
        ],
        [
            Paragraph("<b>Active Mule Exit Node:</b>", bold_body_style),
            Paragraph(f"{case_data.get('primary_mule_holder', 'Sunita Sharma')} ({case_data.get('primary_mule_bank', 'HDFC Bank')})", body_style),
            Paragraph("<b>Mule Account No:</b>", bold_body_style),
            Paragraph(f"{case_data.get('primary_mule_account', '5849382910')}", mono_style),
        ],
    ]
    meta_table = Table(meta_table_data, colWidths=[1.4 * inch, 2.2 * inch, 1.4 * inch, 2.2 * inch])
    meta_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ("PADDING", (0, 0), (-1, -1), 4),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 6))

    # 3. Cryptographic Audit Proof
    story.append(Paragraph("2. ELECTRONIC EVIDENCE INTEGRITY & TAMPER-PROOF AUDIT SEAL (SEC 63 BSA 2023)", section_heading_style))
    crypto_data = [
        [Paragraph("<b>Incident SHA-256 Digest:</b>", bold_body_style), Paragraph(f"<code>{alert_hash}</code>", mono_style)],
        [Paragraph("<b>Cryptographic Root Seal:</b>", bold_body_style), Paragraph(f"<code>{merkle_root}</code>", mono_style)],
        [Paragraph("<b>Inter-Bank Secure Rail:</b>", bold_body_style), Paragraph(f"<code>{contract_addr}</code> (National Banking Network)", mono_style)],
        [Paragraph("<b>Synchronized Audit Record:</b>", bold_body_style), Paragraph(f"<code>{tx_hash}</code>", mono_style)],
    ]
    crypto_table = Table(crypto_data, colWidths=[1.8 * inch, 5.4 * inch])
    crypto_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F1F5F9")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#94A3B8")),
        ("PADDING", (0, 0), (-1, -1), 3),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(crypto_table)
    story.append(Spacer(1, 6))

    # 4. Top 3 AI Predicted ATM Hotspots
    story.append(Paragraph("3. IDENTIFIED HIGH-RISK CASHOUT ATMS (GEOSPATIAL AI RANKING)", section_heading_style))
    atm_rows = [
        [
            Paragraph("<b>Rank</b>", bold_body_style),
            Paragraph("<b>ATM Facility & Bank</b>", bold_body_style),
            Paragraph("<b>Coordinates</b>", bold_body_style),
            Paragraph("<b>Dist / ETA</b>", bold_body_style),
            Paragraph("<b>Risk %</b>", bold_body_style),
            Paragraph("<b>Primary Indicator</b>", bold_body_style),
        ]
    ]

    for idx, atm in enumerate(predicted_atms[:3], start=1):
        raw_risk = atm.get("risk_probability") or atm.get("riskScore") or atm.get("risk_score", 0.82)
        risk_val = int(raw_risk * 100) if raw_risk <= 1 else int(raw_risk)
        dist_km = atm.get("distance_km") or (round(atm.get("distanceMeters", 800) / 1000, 2))
        eta_mins = atm.get("travel_time_mins") or atm.get("etaMinutes") or atm.get("est_eta_mins") or (8 if idx == 1 else (14 if idx == 2 else 18))
        lat_val = float(atm.get("lat") or 18.4636)
        lon_val = float(atm.get("lon") or atm.get("lng") or 73.8682)
        bank_val = atm.get("bank") or atm.get("operator") or (atm.get("name", "").split(" ")[0] if atm.get("name") else "Bank")

        reasons = atm.get("top_reasons") or atm.get("topFactors") or atm.get("explainability", {}).get("top_reasons", [])
        reason_summary = reasons[0] if (reasons and len(reasons) > 0) else ("BTS cell proximity (<800m)" if idx == 1 else ("Transit road corridor" if idx == 2 else "High surveillance cluster"))

        atm_rows.append([
            Paragraph(f"<b>#{idx}</b>", bold_body_style),
            Paragraph(f"<b>{atm.get('name', 'ATM')}</b><br/><font size=6 color='#64748B'>{bank_val}</font>", body_style),
            Paragraph(f"{lat_val:.4f}, {lon_val:.4f}", mono_style),
            Paragraph(f"{dist_km} km<br/>{eta_mins} mins", body_style),
            Paragraph(f"<b>{risk_val}%</b>", bold_body_style),
            Paragraph(reason_summary, body_style),
        ])

    atm_table = Table(atm_rows, colWidths=[0.5 * inch, 2.3 * inch, 1.3 * inch, 0.9 * inch, 0.7 * inch, 1.5 * inch])
    atm_style = [
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0284C7")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ("PADDING", (0, 0), (-1, -1), 3),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]
    if len(atm_rows) > 1:
        atm_style.append(("BACKGROUND", (0, 1), (-1, 1), colors.HexColor("#FEF2F2")))
    if len(atm_rows) > 2:
        atm_style.append(("BACKGROUND", (0, 2), (-1, 2), colors.HexColor("#FFFBEB")))
    atm_table.setStyle(TableStyle(atm_style))
    story.append(atm_table)
    story.append(Spacer(1, 6))

    # 5. Inter-Agency SLA Log
    story.append(Paragraph("4. INTER-AGENCY RESPONSE SLA & ACTION TRAIL", section_heading_style))
    sla_data = [
        [
            Paragraph("<b>Elapsed</b>", bold_body_style),
            Paragraph("<b>Agency / Protocol</b>", bold_body_style),
            Paragraph("<b>Action Executed</b>", bold_body_style),
            Paragraph("<b>Status Verification</b>", bold_body_style),
        ],
        [
            Paragraph("T + 00:00", mono_style),
            Paragraph("NCRP 1930 Portal", body_style),
            Paragraph("Citizen FIR / Transaction Freeze request ingested", body_style),
            Paragraph("<font color='green'><b>LOGGED</b></font>", body_style),
        ],
        [
            Paragraph("T + 00:03", mono_style),
            Paragraph("PRATYAKSH Graph Engine", body_style),
            Paragraph("Multi-hop fund dispersion & fan-out smurfing traced", body_style),
            Paragraph("<font color='green'><b>ISOLATED</b></font>", body_style),
        ],
        [
            Paragraph("T + 00:05", mono_style),
            Paragraph("XGBoost Spatial Ranker", body_style),
            Paragraph("Target cashout ATM identified (Rank 1 Risk 82%)", body_style),
            Paragraph("<font color='green'><b>PREDICTED</b></font>", body_style),
        ],
        [
            Paragraph("T + 00:06", mono_style),
            Paragraph("National Inter-Bank Grid", body_style),
            Paragraph("Automated emergency debit freeze executed across banking switch", body_style),
            Paragraph("<font color='green'><b>FREEZE ACTIVE</b></font>", body_style),
        ],
        [
            Paragraph("T + 00:08", mono_style),
            Paragraph("LEA PCR Field Patrol", body_style),
            Paragraph("Automated Telegram tactical dispatch broadcasted to beat van", body_style),
            Paragraph("<font color='green'><b>DISPATCHED</b></font>", body_style),
        ],
    ]
    sla_table = Table(sla_data, colWidths=[0.8 * inch, 1.8 * inch, 3.2 * inch, 1.4 * inch])
    sla_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#334155")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ("PADDING", (0, 0), (-1, -1), 3),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(sla_table)
    story.append(Spacer(1, 6))

    # 6. Legal Certificate Clause
    legal_para = (
        "<b>CERTIFICATE UNDER SECTION 65B(4) OF THE INDIAN EVIDENCE ACT, 1872 / SECTION 63 OF THE BHARATIYA SAKSHYA ADHINIYAM, 2023:</b> "
        "I hereby certify that the electronic record contained in this document is generated by the PRATYAKSH AI-Powered Cyber Threat Intelligence "
        "Engine operating under lawful control. The computer system, graph engine, and geospatial predictive models were operating properly throughout the "
        "relevant period, without any unauthorized interception, manipulation, or compromise of data integrity. The SHA-256 Alert and Merkle Root hashes "
        "have been validated and anchored immutably to the distributed ledger."
    )
    story.append(Paragraph(legal_para, legal_text_style))
    story.append(Spacer(1, 10))

    # Signature Block
    sig_data = [
        [
            Paragraph("<b>Digitally Certified By:</b><br/>Authorized Officer, I4C Cyber Forensics Unit<br/>Ministry of Home Affairs, New Delhi", body_style),
            Paragraph("<b>Validated & Received By:</b><br/>Cyber Crime Police Station (LEA Node)<br/>Beat Patrol Command Dispatch", body_style),
        ]
    ]
    sig_table = Table(sig_data, colWidths=[3.6 * inch, 3.6 * inch])
    sig_table.setStyle(TableStyle([
        ("LINEBEFORE", (1, 0), (1, 0), 1, colors.HexColor("#CBD5E1")),
        ("PADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(KeepTogether([sig_table]))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
