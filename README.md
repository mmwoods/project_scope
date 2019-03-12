[![Netlify Status](https://api.netlify.com/api/v1/badges/40087c29-7d7f-4682-9562-d4630522846f/deploy-status)](https://app.netlify.com/sites/scope/deploys)

# project_scope

For use in Custom Web Design: Project Scope.

Parses markdown into a javascript object, and calculates Coding, Design and Total hours for each segment/page of a websites Project Scope.

---

## Input

```markdown
---

## Title ()

<--
Coding 1hr
Design 2hr
-->

- A 'Login/Register' link, once logged in change to 'My Account'.
- A 'My Wishlist' link, which when logged in takes a user to the wishlist section within the account page.<!-- 15m -->

---
```

## Output

```javascript
{
    title: "Title"
    comments: [{
            line: "Coding 1hr"
            hours: 1
            type: "coding"
        },
        {
            line: "Design 2hr"
            hours: 2
            type: "design"
        }
    ]
    content: [{
            line: "- A 'Login/Register' link, once logged in change to 'My Account'."
            hours: 0
            type: "coding"
        },
        {
            line: "- A 'My Wishlist' link, which when logged in takes…list section within the account page.<!-- 15m -->"
            hours: 0.25
            type: "coding"
        }
    ]
    hours: {
        coding: 1.25,
        design: 2,
        total: 3.25
    }
}
```

---

## Code Standards

### Sections

Each section/page must be surrounded by '---'.

```markdown
---

section/page

---
```

---

### Titles

Each section/page must have a h2 (##) title with brackets:

```markdown
## Title (xxhr)
```

---

### Times

Times on sub-bullets will not be calculated, they need to be on normal bullets:

```markdown
- A 'My Wishlist' link, which when logged in takes a user to the wishlist section within the account page.<!-- 15m -->
  - Extra information <!-- 30m -->
```

#### Returns

```javascript
hours: {
    coding: 0.25,
    design: 0,
    total: 0.25
}
```

---

### Comments

Comments will be calculated if formatted as below:

```markdown
<--
Coding 1hr
Design 2hr
-->
```

#### Returns

```javascript
hours: {
    coding: 1,
    design: 2,
    total: 3
}
```
