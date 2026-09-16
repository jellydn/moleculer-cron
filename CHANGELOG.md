<a name="0.1.0"></a>
# 0.1.0 (2026-09-16)

## New
- Support Moleculer v0.15 while remaining compatible with v0.14.32+
- Start jobs when a service is created after `broker.start()` (`started` + `$broker.started`)
- Add GitHub Actions CI on Node 22 and 24

## Changes
- Bump `moleculer` peer dependency to `^0.14.32 || ^0.15.0`
- Require Node.js >= 18 (Moleculer 0.15 itself requires Node 22)
- Align TypeScript types with the mixin API and Moleculer 0.15 `ServiceSettingSchema`

## Fixes
- Declare job callback binders so they no longer leak as globals

--------------------------------------------------

<a name="0.x.x"></a>
# 0.x.x (2017-xx-xx)

## New

## Fixes

## Breaking changes

## Changes

--------------------------------------------------
