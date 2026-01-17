# Browser Tab Assignments for Multi-Agent Workspace

## Purpose
When multiple AI agents work simultaneously on different projects in this workspace, each agent needs a dedicated browser tab to avoid conflicts and confusion.

## Current Tab Assignments

### Adava University Project
- **Project Path:** `/Users/lucas/cursor projects/adavauniversity.org`
- **Production URL:** https://adavauniversity.org
- **Assigned Tab:** Tab for Adava University (navigate to https://adavauniversity.org)
- **Agent Responsibility:** Any agent working on Adava University project
- **Tab Identification:** URL will be `https://adavauniversity.org` or `adavauniversity.org`

## Protocol for Agents

### When Starting Work on Adava University:
1. List browser tabs: `browser_tabs` action "list"
2. Check if Adava University tab exists (look for adavauniversity.org URL)
3. If exists: Select that tab using `browser_tabs` action "select" with index
4. If not exists: Create new tab and navigate to https://adavauniversity.org
5. Continue work in that tab

### If Tab Changed by Another Agent:
1. Don't panic - tabs are independent
2. Use `browser_tabs` action "list" to find your tab
3. Use `browser_tabs` action "select" with correct index to return
4. Continue where you left off

### Tab Etiquette:
- **DO NOT** close tabs you didn't create
- **DO NOT** navigate away from another agent's tab
- **ALWAYS** check current tab before taking actions
- **ALWAYS** return to your assigned tab if switched

## Example Commands

```javascript
// List all tabs
browser_tabs({ action: "list" })

// Create new tab for Adava University
browser_tabs({ action: "new" })
browser_navigate({ url: "https://adavauniversity.org" })

// Switch to tab index 2
browser_tabs({ action: "select", index: 2 })
```

## Other Projects (To Be Added)

When other agents start working on other websites, add them here:

### Movie Trailer Finder
- **Project Path:** `/Users/lucas/cursor projects/movie-trailer-finder`
- **URL:** TBD
- **Assigned Tab:** TBD

### Recruiter Toolkit  
- **Project Path:** `/Users/lucas/cursor projects/recruiter-toolkit`
- **URL:** TBD
- **Assigned Tab:** TBD

---

**Last Updated:** 2026-01-17  
**Maintained By:** Multi-agent coordination system
