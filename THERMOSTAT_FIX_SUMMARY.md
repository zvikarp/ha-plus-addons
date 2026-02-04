# Thermostat Deadband Constraint Fix

## Overview
This document describes the fix for the Matter.js thermostat constraint error that caused crashes during initialization.

## Error
```
Error in reactor: minHeatSetpointLimit (1600) must be <= minCoolSetpointLimit (1600) - minSetpointDeadBand (200) (code 135)
```

## Solution
The fix has been implemented in the source repository: `zvikarp/ha-plus-matter-hub`

### Branch
`fix/thermostat-deadband-clamping`

### Commit
`fe6ae6bb9b44bd16f8e8ff03a4ab365491219ea2`
"fix: Properly clamp thermostat limits to satisfy Matter.js deadband constraint"

### Files Modified
1. `packages/backend/src/matter/behaviors/thermostat-server.ts`
   - Enhanced buildSetpointLimits() with proper bilateral clamping
   - Added JSDoc documentation
   - Added validation logging
   - +56 lines, -6 lines

2. `packages/backend/src/matter/behaviors/thermostat-server.test.ts` (NEW)
   - Comprehensive test suite with 7 test cases
   - +207 lines

### Key Changes
The fix ensures that when both heating and cooling are supported with a deadband:
- Cooling min is raised: `minCool = max(minCool, minHeat + deadband)`
- Cooling max maintains consistency: `maxCool = max(maxCool, minCool)`
- **NEW:** Heating max is clamped: `maxHeat = min(maxHeat, minCool - deadband)`
- **NEW:** Heating min maintains consistency: `minHeat = min(minHeat, maxHeat)`

This satisfies the Matter.js constraints:
- `minHeatSetpointLimit <= minCoolSetpointLimit - minSetpointDeadBand`
- `maxHeatSetpointLimit <= maxCoolSetpointLimit - minSetpointDeadBand`

### Testing
All tests pass:
```
✓ 7 new thermostat tests
✓ 61 total backend tests
```

### Next Steps to Deploy
1. Merge the fix branch into main in `zvikarp/ha-plus-matter-hub`
2. Build new Docker image with the fix
3. Update `ghcr.io/zvikarp/ha-plus-matter-hub-addon` image tag
4. Test with the problematic AC entity
5. Verify no initialization crashes
6. Verify Matter controllers can control temperatures

## Implementation Details
See the full patch file and detailed documentation in the source repository.
