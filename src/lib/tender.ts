// Course titles that every Tender account is auto-enrolled in. Enrollment is matched
// by exact course title, so a course only needs to exist with one of these titles for
// Tender accounts to start picking it up automatically — no further code changes needed.
//
export const TENDER_COURSE_TITLES = ["Information Security & 27001", "CPD Case Study: Andy & Kate"];

// The app resources (as opposed to courses) every Tender account gets, regardless of role.
export const TENDER_RESOURCE_LABELS = ["Videos", "Drug Street Name Search", "Alcohol Unit Calculator"];

export const TENDER_FIXED_ACCESS_SUMMARY = [...TENDER_COURSE_TITLES, ...TENDER_RESOURCE_LABELS];
