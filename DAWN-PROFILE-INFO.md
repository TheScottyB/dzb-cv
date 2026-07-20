# 📋 Dawn's Profile Information Guide

## 🎯 **IMPORTANT: Which File to Edit**

**✅ MAIN FILE TO EDIT**: `/base-info.json` (root directory)

This is your **REAL** profile data that contains:
- ✅ Your actual email: DZ4100@gmail.com  
- ✅ Your actual phone: 847.287.1148
- ✅ Your actual address: Harvard, IL
- ✅ Your complete EKG certification details
- ✅ Your full work history and professional summary

## 📁 **File Structure Explained**

```
dzb-cv/
├── base-info.json                    ← **EDIT THIS ONE** (Your real data)
├── src/data/dawn-base-info.json      ← Default/placeholder data
├── data/base-info.json               ← Legacy file
└── src/shared/data/base-info.json    ← Legacy file
```

## ✅ **Current Status**

The CV generation system now **automatically uses your real data** from `base-info.json`!

When you run:
```bash
pnpm run generate:ekg-cv
```

You'll see:
```
📋 Loading Dawn's real profile data from base-info.json
✅ Loaded and adapted Dawn's real profile data
```

## 📝 **How to Update Your Information**

1. **Edit the main file**:
   ```bash
   nano base-info.json
   ```

2. **Update any section** (examples):
   ```json
   {
     "personalInfo": {
       "contact": {
         "email": "DZ4100@gmail.com",      ← Update if needed
         "phone": "847.287.1148",          ← Update if needed
         "address": "Your current address"  ← Update if needed
       }
     },
     "professionalSummary": "Your updated summary...",
     "education": [
       {
         "certification": "New Certification",
         "institution": "Institution Name",
         "year": "2025",
         "status": "Current"
       }
     ]
   }
   ```

3. **Regenerate your CV**:
   ```bash
   pnpm run generate:ekg-cv
   ```

## 🎯 **Your Current Real Information Includes**

- ✅ **Real Contact**: DZ4100@gmail.com, 847.287.1148
- ✅ **Real Address**: 15810 IL Rt. 173 #2F, Harvard, IL 60033
- ✅ **EKG Certification**: Certified EKG Technician (CET), National Healthcareer Association (NHA), July 2025
- ✅ **BLS / CPR**: BLS Provider (CPR/AED), American Heart Association — issued Oct 15, 2025, renew by Oct 2027 (Training Center: Northwestern Medicine McHenry Hospital)
- ✅ **Medical Terminology**: McHenry County College, Summer 2025
- ✅ **CNA**: Certified Nursing Assistant, McHenry County College, Fall 2025 (Completed)
- ✅ **Phlebotomy**: Certified Phlebotomy Technician (CPT), NHA — training started March 2, 2026; certification exam May 2026
- ✅ **Medical Assistant Capstone**: McHenry County College, June 3 – Aug 6, 2026 — In Progress (NHA CCMA candidate; 60-hour clinical)
- ✅ **Complete Professional Summary**: 40+ years healthcare experience
- ✅ **Real Estate Background**: Current since 2006
- ✅ **Pharmacy Tech Experience**: Osco Pharmacy, 1996

## 🚀 **Quick Commands**

```bash
# Generate CV with your real data
pnpm run generate:ekg-cv

# Generate PDF
pnpm run generate:pdf

# Check quality
pnpm run check:quality

# View your current data
cat base-info.json
```

## ✨ **Result**

Your generated CVs now show:
- **Real contact information** for employers to reach you
- **Actual certifications** with correct dates and institutions  
- **Complete work history** including real estate and healthcare
- **Professional summary** reflecting your 40+ years of experience

**Your CV generation system is now using your real, professional data!** 🎉