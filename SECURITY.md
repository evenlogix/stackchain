# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | ✅ |

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Email **contact@evenlogix.com** or open a [private security advisory](https://github.com/evenlogix/stackchain/security/advisories/new) on GitHub with:

- A description of the issue
- Steps to reproduce
- Impact assessment (if known)
- Any suggested fix

We aim to acknowledge reports within **72 hours** and provide a remediation timeline after triage.

## Scope

In scope:

- The StackChain CLI and monorepo packages
- Official `@evenlogix/stackchain-*` plugins
- Template generation paths that could overwrite unexpected files outside the project directory

Out of scope:

- Vulnerabilities only present in user-modified generated applications
- Issues in third-party Flutter/React dependencies generated into projects (report upstream)

## Safe Harbor

We will not pursue legal action against researchers who:

- Make a good faith effort to avoid privacy violations and service disruption
- Report vulnerabilities promptly
- Do not exploit issues beyond what is needed to demonstrate impact
