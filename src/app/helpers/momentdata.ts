import { Injectable } from '@angular/core';
import * as moment from 'moment-timezone';
import * as _ from 'underscore';

export class MomentData {

    constructor() {
    }

    getTimeZones() {
        let names = moment.tz.names();
        let timeZones = []

        _.each(names, function (name) {
            var timeZoneOffset = moment.tz(name).format('Z');
            var offSet = timeZoneOffset.split(":");
            var offSetValue = parseFloat(offSet[0]) + parseFloat(offSet[1]) * (1 / 60);
            var text = "(GMT " + timeZoneOffset + ") " + name;

            timeZones.push({
                name: name,
                text: text,
                offset: timeZoneOffset,
                offSetValue: offSetValue
            });
        });

        timeZones.sort(function (a, b) {
            return parseInt(a.offset.replace(":", ""), 10) - parseInt(b.offset.replace(":", ""), 10);
        });

        return timeZones;
    };

    getCurrenTimeZone() {
        return moment.tz.guess();
    }


    getLocalDateToTimeZoneDate(date: string, timeZoneName: string) {
        return moment(Date.parse(date)).tz(timeZoneName).format("MM/DD/YYYY h:mm A");
    }
}
