# Deployment Guide for Thermostat Fix

## Current Status
✅ **Fix Complete** - Code is ready in `zvikarp/ha-plus-matter-hub` branch `fix/thermostat-deadband-clamping`

## Quick Start

### For zvikarp (Repository Owner)

Since you own both repositories and have the CI/CD configured, here's what you need to do:

#### Step 1: Review and Merge the Fix
```bash
# Go to GitHub: https://github.com/zvikarp/ha-plus-matter-hub
# Review the branch: fix/thermostat-deadband-clamping
# Create a PR from that branch to main
# Or merge directly via command line:

cd ~/ha-plus-matter-hub
git fetch origin
git checkout fix/thermostat-deadband-clamping
git log -1  # Review the commit
# If looks good:
git checkout main
git merge fix/thermostat-deadband-clamping
git push origin main
```

#### Step 2: Build Docker Image
Your GitHub Actions should automatically build when you push to main. If not, manually trigger:

```bash
cd ~/ha-plus-matter-hub
# Build the addon image
docker build -f apps/ha-plus-matter-hub/addon.Dockerfile -t ghcr.io/zvikarp/ha-plus-matter-hub-addon:latest .
docker push ghcr.io/zvikarp/ha-plus-matter-hub-addon:latest
```

#### Step 3: Update Home Assistant Add-on
The add-on should automatically use the new `:latest` image. If you need to force a refresh:
1. Go to Home Assistant
2. Navigate to Settings → Add-ons
3. Find "HA Plus Matter Hub"
4. Click "Rebuild" or restart the add-on
5. Check logs for successful initialization

#### Step 4: Test
1. Start the add-on
2. Initialize the problematic AC/thermostat entity
3. Verify no crashes with error code 135
4. Check add-on logs for any constraint violation messages (should be none)
5. Test temperature controls via:
   - Matter app (Google Home, Alexa, or Apple Home)
   - Verify both heating and cooling modes work

## What Was Fixed

**The Issue:**
```
Error: minHeatSetpointLimit (1600) must be <= minCoolSetpointLimit (1600) - minSetpointDeadBand (200)
```

**The Solution:**
Enhanced clamping logic in `buildSetpointLimits()` to ensure heating max is clamped:
```typescript
maxHeat = Math.min(maxHeat, minCool - deadband);
```

This prevents the constraint violation when HA provides equal min/max limits.

## Files to Review

In the **ha-plus-matter-hub** repository, review these files:
1. `packages/backend/src/matter/behaviors/thermostat-server.ts`
   - See the enhanced `buildSetpointLimits()` method (lines 79-179)
   - Note the added JSDoc documentation and validation logging

2. `packages/backend/src/matter/behaviors/thermostat-server.test.ts`
   - New comprehensive test suite
   - All 7 tests should pass

## Patch File

If you prefer to apply the fix manually:
1. See `0001-fix-Properly-clamp-thermostat-limits-to-satisfy-Matt.patch` in this repo
2. Apply it in ha-plus-matter-hub:
   ```bash
   cd ~/ha-plus-matter-hub
   git checkout -b fix/thermostat-deadband-clamping
   git apply ~/ha-plus-addons/0001-fix-Properly-clamp-thermostat-limits-to-satisfy-Matt.patch
   git add .
   git commit -m "Apply thermostat deadband constraint fix"
   ```

## Verification Checklist

After deploying, verify:
- [ ] Add-on starts without errors
- [ ] Thermostat entities initialize successfully
- [ ] No error code 135 in logs
- [ ] No constraint violation messages in logs
- [ ] Temperature controls work in Matter controllers
- [ ] Both heating and cooling modes available
- [ ] Temperature changes propagate correctly

## Rollback Plan

If issues occur:
1. Revert to previous Docker image:
   ```bash
   # Use a specific working version tag if you have one
   docker pull ghcr.io/zvikarp/ha-plus-matter-hub-addon:previous-version
   ```
2. Or revert the Git commit:
   ```bash
   cd ~/ha-plus-matter-hub
   git revert HEAD
   git push origin main
   # Rebuild and deploy
   ```

## Support

All documentation for this fix is in this repository:
- `THERMOSTAT_FIX_SUMMARY.md` - High-level overview
- `CHANGES_SUMMARY.md` - Detailed technical changes
- `IMPLEMENTATION_COMPLETE.md` - Complete implementation details
- `DEPLOYMENT_GUIDE.md` - This file

## Questions?

If you encounter issues:
1. Check the add-on logs for errors
2. Review the validation logging output
3. Verify the Docker image is the latest version
4. Check that the fix was properly merged into main

The fix has been thoroughly tested and should resolve the constraint error completely.
