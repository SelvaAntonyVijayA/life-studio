import { Directive, forwardRef } from '@angular/core';
import { NG_VALIDATORS, AbstractControl, ValidatorFn, Validator, FormControl } from '@angular/forms';


function isNullOrEmpty(str: any) {
    return (typeof str === "undefined" || str === null || str === "") ? true : (typeof str === "string" && str.trim().length > 0) || (typeof str === "boolean" || typeof str === "object" || typeof str === "number" || typeof str === "function" || this.isDate(str)) ? false : true;
}

function validateGeoFactory(): ValidatorFn {
    return (c: AbstractControl) => {
        let Geo_RegExp = new RegExp("^\-?[0-9]{1,7}(\.[0-9]+)?$");

        if (isNullOrEmpty(c.value) || Geo_RegExp.exec(c.value)) {
            return null;
        } else {
            return {
                geo: {
                    valid: false
                }
            };
        }

    }
}

@Directive({
    selector: '[geo][ngModel]',
    providers: [
        { provide: NG_VALIDATORS, useExisting: GeoValidator, multi: true },

    ]
})

export class GeoValidator implements Validator {
    validator: ValidatorFn;

    constructor() {
        this.validator = validateGeoFactory();
    }

    validate(c: FormControl) {
        return this.validator(c);
    }
}