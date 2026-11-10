# Security Policy

Ultra Card runs inside the Home Assistant frontend, so a vulnerability here can
affect a user's whole smart home. Reports are taken seriously and handled
privately until a fix is released.

## Reporting a vulnerability

Please do not open a public issue for a security problem.

Report it privately through GitHub: open the repository's **Security** tab and
choose **Report a vulnerability**
(<https://github.com/WJDDesigns/Ultra-Card/security/advisories/new>).

Include, as far as you can:

- the Ultra Card version and how it was installed (HACS or manual)
- what an attacker needs (a preset, a shared YAML snippet, network position)
- steps or a minimal card config that reproduces it
- what the attacker gains

You should get an acknowledgement within a few days. Once a fix ships you will
be credited in the release notes unless you would rather not be.

## Supported versions

Fixes go into the latest stable release and the current beta. Older versions
are not patched; please update through HACS.

## Scope

In scope: this repository (the card, its editor, the Hub panel) and the release
artifacts published from it.

Also welcome, through the same channel: issues in the Ultra Card Connect
integration and the ultracard.io preset and account APIs.

Out of scope: behavior that needs an attacker who already has administrator
access to the Home Assistant instance, and JavaScript a user deliberately wrote
into their own card (for example navigation `[[[ ... ]]]` templates on a card
they authored).
