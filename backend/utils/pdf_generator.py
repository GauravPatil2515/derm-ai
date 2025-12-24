from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from datetime import datetime
import os
import io
import base64

class PDFReportGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.setup_custom_styles()

    def setup_custom_styles(self):
        # Brand colors
        self.pink_900 = colors.HexColor('#831843')
        self.pink_800 = colors.HexColor('#9d174d')
        self.pink_700 = colors.HexColor('#be185d')
        self.pink_600 = colors.HexColor('#db2777')
        self.pink_100 = colors.HexColor('#fce7f3')
        self.pink_50 = colors.HexColor('#fdf2f8')
        
        self.styles.add(ParagraphStyle(
            name='ReportTitle',
            parent=self.styles['Heading1'],
            fontSize=28,
            spaceAfter=10,
            textColor=self.pink_800,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='Subtitle',
            parent=self.styles['Normal'],
            fontSize=12,
            spaceAfter=30,
            textColor=colors.gray,
            alignment=TA_CENTER
        ))
        
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceBefore=25,
            spaceAfter=12,
            textColor=self.pink_700,
            fontName='Helvetica-Bold',
            borderPadding=(8, 8, 8, 8),
            borderColor=self.pink_100,
            borderWidth=0,
            backColor=self.pink_50,
            borderRadius=4
        ))

        self.styles.add(ParagraphStyle(
            name='NormalText',
            parent=self.styles['Normal'],
            fontSize=11,
            leading=16,
            spaceAfter=8,
            alignment=TA_JUSTIFY
        ))
        
        self.styles.add(ParagraphStyle(
            name='BulletText',
            parent=self.styles['Normal'],
            fontSize=11,
            leading=16,
            spaceAfter=4,
            leftIndent=20,
            bulletIndent=10
        ))

        self.styles.add(ParagraphStyle(
            name='HighConfidence',
            parent=self.styles['Normal'],
            fontSize=14,
            textColor=colors.HexColor('#166534'),  # Green
            fontName='Helvetica-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='MediumConfidence',
            parent=self.styles['Normal'],
            fontSize=14,
            textColor=colors.HexColor('#ca8a04'),  # Yellow
            fontName='Helvetica-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='LowConfidence',
            parent=self.styles['Normal'],
            fontSize=14,
            textColor=colors.HexColor('#dc2626'),  # Red
            fontName='Helvetica-Bold'
        ))

        self.styles.add(ParagraphStyle(
            name='Disclaimer',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=colors.gray,
            alignment=TA_CENTER,
            spaceBefore=30
        ))
        
        self.styles.add(ParagraphStyle(
            name='Footer',
            parent=self.styles['Normal'],
            fontSize=8,
            textColor=colors.lightgrey,
            alignment=TA_CENTER
        ))

    def get_confidence_style(self, confidence):
        if confidence >= 80:
            return 'HighConfidence'
        elif confidence >= 50:
            return 'MediumConfidence'
        else:
            return 'LowConfidence'

    def generate_report(self, analysis_data, image_path=None):
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=60,
            leftMargin=60,
            topMargin=50,
            bottomMargin=50
        )

        story = []

        # ============ HEADER ============
        story.append(Paragraph("🔬 DermAI", self.styles['ReportTitle']))
        story.append(Paragraph("AI-Powered Skin Analysis Report", self.styles['Subtitle']))
        
        # Divider line
        story.append(HRFlowable(width="100%", thickness=2, color=self.pink_100, spaceBefore=0, spaceAfter=20))
        
        # Report metadata
        report_date = datetime.now().strftime('%B %d, %Y at %I:%M %p')
        story.append(Paragraph(f"<b>Report Generated:</b> {report_date}", self.styles['NormalText']))
        story.append(Spacer(1, 15))

        # ============ ANALYZED IMAGE ============
        if image_path and os.path.exists(image_path):
            story.append(Paragraph("Analyzed Image", self.styles['SectionHeader']))
            try:
                img = Image(image_path, width=4*inch, height=3*inch)
                img.hAlign = 'CENTER'
                story.append(img)
                story.append(Spacer(1, 15))
            except Exception as e:
                story.append(Paragraph(f"[Image could not be loaded: {str(e)}]", self.styles['NormalText']))

        # ============ PRIMARY DIAGNOSIS ============
        story.append(Paragraph("Primary Diagnosis", self.styles['SectionHeader']))
        
        # Extract data
        primary = analysis_data.get('primary_analysis', {})
        condition = primary.get('condition', analysis_data.get('predicted_condition', 'Unknown'))
        confidence = primary.get('confidence', analysis_data.get('confidence_score', 0))
        if isinstance(confidence, float) and confidence < 1:
            confidence = confidence * 100  # Convert from decimal
        
        # Diagnosis table with confidence indicator
        conf_style = self.get_confidence_style(confidence)
        
        data = [
            ['Detected Condition', condition],
            ['Confidence Level', f"{confidence:.1f}%"],
            ['Risk Assessment', self._get_risk_level(confidence)]
        ]
        
        t = Table(data, colWidths=[2.2*inch, 3.3*inch])
        t.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('TEXTCOLOR', (0, 0), (0, -1), self.pink_900),
            ('TEXTCOLOR', (1, 0), (1, 0), colors.black),
            ('BACKGROUND', (0, 0), (-1, -1), self.pink_50),
            ('GRID', (0, 0), (-1, -1), 1, colors.white),
            ('PADDING', (0, 0), (-1, -1), 12),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ]))
        story.append(t)
        story.append(Spacer(1, 20))

        # ============ DETAILED ANALYSIS ============
        detailed = analysis_data.get('detailed_analysis', {})
        
        sections = [
            ('📋 Overview', detailed.get('overview', primary.get('description', ''))),
            ('🩺 Symptoms', detailed.get('symptoms', '')),
            ('💊 Treatment Options', detailed.get('treatment', '')),
            ('🛡️ Prevention Tips', detailed.get('prevention', '')),
            ('⚠️ When to See a Doctor', detailed.get('when_to_see_doctor', ''))
        ]
        
        for title, content in sections:
            if content:
                story.append(Paragraph(title, self.styles['SectionHeader']))
                # Handle bullet points if content contains them
                if '•' in content or '-' in content:
                    lines = content.split('\n')
                    for line in lines:
                        line = line.strip()
                        if line:
                            if line.startswith('•') or line.startswith('-'):
                                story.append(Paragraph(f"• {line.lstrip('•-').strip()}", self.styles['BulletText']))
                            else:
                                story.append(Paragraph(line, self.styles['NormalText']))
                else:
                    story.append(Paragraph(content, self.styles['NormalText']))

        # ============ DISCLAIMER ============
        story.append(Spacer(1, 30))
        story.append(HRFlowable(width="100%", thickness=1, color=self.pink_100, spaceBefore=0, spaceAfter=10))
        story.append(Paragraph(
            "<b>IMPORTANT DISCLAIMER:</b><br/>"
            "This report is generated by DermAI, an artificial intelligence system, and is for informational purposes only. "
            "It does NOT constitute a medical diagnosis. The accuracy of AI predictions may vary. "
            "Please consult a certified dermatologist or healthcare professional for proper medical advice and treatment.",
            self.styles['Disclaimer']
        ))
        
        # Footer
        story.append(Spacer(1, 20))
        story.append(Paragraph(
            f"© {datetime.now().year} DermAI - AI-Powered Dermatology Platform",
            self.styles['Footer']
        ))

        doc.build(story)
        buffer.seek(0)
        return buffer
    
    def _get_risk_level(self, confidence):
        if confidence >= 85:
            return "High Confidence - Likely Match"
        elif confidence >= 70:
            return "Moderate Confidence - Probable Match"
        elif confidence >= 50:
            return "Low Confidence - Possible Match"
        else:
            return "Very Low Confidence - Uncertain"
