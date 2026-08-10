from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

brief = Path('output/Canopy_AI_ThermoNet_5G_Project_Brief.docx')
guide = Path('output/Canopy_AI_ThermoNet_5G_Technical_Breakdown_Plain_English.docx')
out = Path('output/Canopy_AI_ThermoNet_5G_Compiled_Checked_Brief_and_Technical_Guide.docx')

def document_xml(path):
    with ZipFile(path) as z:
        return z.read('word/document.xml').decode('utf-8')

brief_xml = document_xml(brief)
guide_xml = document_xml(guide)

# The guide was checked against the codebase. The current model predicts a synthetic
# throttling-risk score; the repository does not implement or validate a 72-hour horizon.
guide_inner = guide_xml.split('<w:body>', 1)[1]
guide_inner = guide_inner[:guide_inner.rfind('<w:sectPr')]
guide_inner = guide_inner.replace('72-hour risk percentage', 'prototype throttling-risk percentage')
guide_inner = guide_inner.replace('72-hour risk,', 'prototype throttling-risk,')
guide_inner = guide_inner.replace('72-hour risk model', 'throttling-risk model')
guide_inner = guide_inner.replace('72-hour risk', 'throttling-risk')

appendix = (
    '<w:p><w:pPr><w:pageBreakBefore/><w:spacing w:before="180" w:after="120"/>'
    '<w:pBdr><w:bottom w:val="single" w:sz="4" w:space="7" w:color="E0E0E0"/></w:pBdr></w:pPr>'
    '<w:r><w:rPr><w:b/><w:color w:val="1B4F91"/><w:sz w:val="28"/></w:rPr>'
    '<w:t>Appendix A. Plain-English Technical Breakdown</w:t></w:r></w:p>'
    '<w:p><w:pPr><w:spacing w:after="180"/></w:pPr><w:r><w:rPr><w:i/><w:color w:val="8A8A8A"/><w:sz w:val="18"/></w:rPr>'
    '<w:t>This appendix preserves the detailed codebase explanation and has been checked against the current repository. Statements about live data, forecasting and financial savings are explicitly identified as prototype assumptions where applicable.</w:t></w:r></w:p>'
)

brief_before_section, section_tail = brief_xml.rsplit('<w:sectPr', 1)
compiled_xml = brief_before_section + appendix + guide_inner + '<w:sectPr' + section_tail

with ZipFile(brief) as zin:
    files = {entry.filename: zin.read(entry.filename) for entry in zin.infolist()}
files['word/document.xml'] = compiled_xml.encode('utf-8')
with ZipFile(out, 'w', ZIP_DEFLATED) as zout:
    for name, data in files.items():
        zout.writestr(name, data)
print(out.resolve())
