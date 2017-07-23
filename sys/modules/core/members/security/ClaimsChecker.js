define(() => {
    /**
     * @class sys.core.security.ClaimsChecker
     * @classdesc sys.core.security.ClaimsChecker
     * @desc Check claims.
     */
    return Class('sys.core.security.ClaimsChecker', function(attr) {
        attr('singleton');
        this.func('constructor', () => {
        });

        this.func('check', (requestedClaims, availableAccess) => {
            let success = false;
            if (requestedClaims) {
                if (requestedClaims.length === 1 && 
                    requestedClaims[0] === 'auth') {
                        // this is ok, nothing else needs to be done
                        success = true;
                } else {
                    let orClaims = null,
                        hasClaim = (claim) => {
                            return (availableAccess && availableAccess.indexOf(claim) !== -1);
                        };
                    for(let claim of requestedClaims) {
                        if (claim === 'auth') { 
                            // ignore, since it is added along with other claims
                            continue;
                        }
                        if (claim.indexOf('||') !== -1) {
                            orClaims = claim.split('||');
                            for(let orClaim of orClaims) {
                                success = hasClaim(orClaim);
                                if (success) { break; } // since at least one OR claim found
                            }
                        } else {
                            success = hasClaim(claim);
                            if (!success) { break; } // since at least one AND claim not found
                        }
                    }
                }
            } else {
                success = true;
            }
            return success;
        });
    });
});