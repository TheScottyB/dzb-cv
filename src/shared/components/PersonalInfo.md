# Personal Information Section

## Overview
This component contains the personal information section that appears at the top of each CV.

## Usage
Include this component at the beginning of each template:

```handlebars
# {{personalInfo.name.full}}
**Contact:** {{personalInfo.contact.email}} | {{personalInfo.contact.phone}}{{#if personalInfo.contact.address}} | {{personalInfo.contact.address}}{{/if}}

{{#if profiles.linkedIn}}**LinkedIn:** {{profiles.linkedIn}}{{/if}}
```