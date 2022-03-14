import React, { useContext } from 'react';
import { Chart } from "react-google-charts";
import { groupBy, successRunFilter, calculateSuccessRate } from '../../utils/utils';

import Run from '../../types/run';

import RunsContext from "../../store/runs-context";

import styles from './visual.module.scss';

const getMMDDDate = (dateInput: string): string => {
    const date = new Date(dateInput);
    let month: number = date.getMonth() + 1;
    let monthString: string = `${month}`;
    let day: number = date.getDate();
    let dayString: string = `${day}`;
    if (day < 10) {
        dayString = `0${day}`;
    }
    if (month < 10) {
        monthString = `0${month}`;
    }

    return `${dayString}/${monthString}`;
};

const getYYYYMMDDDate = (date?: Date): string => {
    if (!date) {
        return '';
    }
    let typedDate;
    if(typeof date === 'string') {
        typedDate = new Date(date);
    } else {
        typedDate = date;
    }
    const year = typedDate.getFullYear();
    let month = typedDate.getMonth() + 1;
    let monthString: string = `${month}`;
    let day = typedDate.getDate();
    let dayString: string = `${day}`;
    if (day < 10) {
        dayString = `0${day}`;
    }
    if (month < 10) {
        monthString = `0${month}`;
    }

    return `${year}-${monthString}-${dayString}`;
}

const createDateGroups = (startDate: string, endDate: string, days = 7): DateObject[] => {
    let currentDate = new Date(endDate);
    let startDate2 = new Date(startDate);
    const dateGroups = [] as DateObject[];
    let initial = true;
    while (currentDate > startDate2) {
        if (!initial) {
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            initial = false;
        }
        const currentDateJS = new Date(currentDate);
        currentDate.setDate(currentDateJS.getDate() - (days - 1));
        dateGroups.push({
            startDate: getYYYYMMDDDate(currentDate),
            endDate: getYYYYMMDDDate(currentDateJS)
        });
    }
    return dateGroups;
};

interface DateObject {
    startDate: string | Date,
    endDate: string | Date,
};

interface Variant {
    [key: string]: [];
}

const createDataForGroupsPerGame = (data: Run[], groups: DateObject[]) => {
    const dataGrouped: Run[][][] = [];
    groups.forEach(() => {
        dataGrouped.push([[] as Run[], [] as Run[], [] as Run[], [] as Run[], [] as Run[], [] as Run[]]); // Adding all the games (6: DS1, DS2, DS3, DeS, BB, SK)
    });
    data.forEach(dateItem => {
        groups.forEach((group, groupIndex) => {
            if (dateItem.date && (dateItem.date >= group.startDate && dateItem.date <= group.endDate)) {
                dataGrouped[groupIndex][dateItem.selectedGame].push(dateItem);
            }
        });
    });
    return dataGrouped;
}

const getLastWeekData = (runs: Run[]) => {
    const weekEndDateNoTyped = runs[runs.length - 1].date;
    let weekEndDate;
    if(typeof weekEndDateNoTyped === 'string') {
        weekEndDate = new Date(weekEndDateNoTyped);
    } else {
        weekEndDate = weekEndDateNoTyped;
    }
    let weekStartDate = weekEndDate;
    if (typeof weekStartDate === 'undefined') {
        return;
    }
    weekStartDate.setDate(weekStartDate.getDate() - 7);
    const lastWeekRuns = runs.filter(run => {
        let runDateTimestamp : number = 0;
        if (!run.date || typeof weekStartDate === 'undefined') {
            return false;
        }
        if(typeof run.date === 'string') {
            runDateTimestamp = new Date(run.date).getTime();
        } else {
            runDateTimestamp = run.date.getTime();
        }
        return runDateTimestamp > weekStartDate.getTime();
    });
    const splicedSuccesfulRuns = lastWeekRuns.filter(successRunFilter);
    const runsGroupedByDate = groupBy(splicedSuccesfulRuns as [], 'date');
    const lastWeekRunsGroupedByDate = {};
    for (let i = 0; i < 7; i++) {
        weekStartDate.setDate(weekStartDate.getDate() + 1);
        const weekStartDateYYYYMMDD: string = getYYYYMMDDDate(weekStartDate);
        const value = (runsGroupedByDate as Variant)[weekStartDateYYYYMMDD] || [];
        (lastWeekRunsGroupedByDate as Variant)[weekStartDateYYYYMMDD] = value;
    }
    const nonFilterRunsGroupedByDate = groupBy(lastWeekRuns as [], 'date');
    let labels = Object.keys(lastWeekRunsGroupedByDate).sort((a: string, b: string) => parseInt(a, 10) - parseInt(b, 10));
    const runsGroupedByDateValues: Run[][] = Object.values(lastWeekRunsGroupedByDate);
    const nonFilterRunsGroupedByDateValues: Run[][] = Object.values(nonFilterRunsGroupedByDate);
    let data = runsGroupedByDateValues.map(run => run.length);
    let dataRatio = runsGroupedByDateValues.map((run, index) => {
        debugger;
        return nonFilterRunsGroupedByDateValues[index] ? (run.length / nonFilterRunsGroupedByDateValues[index].length) * 100 : 0
    });

    let lastWeekRunsGrouped = data.map((dataItem, index) => [labels[index], dataItem]);
    lastWeekRunsGrouped = [['Day', 'Succesful Runs'], ...lastWeekRunsGrouped];

    let lastWeekRunsGroupedRatio = dataRatio.map((dataItem, index) => [labels[index], dataItem]);
    lastWeekRunsGroupedRatio = [['Day', 'Succesful Runs %'], ...lastWeekRunsGroupedRatio];

    return { lastWeekRuns: lastWeekRunsGrouped, lastWeekRunsRatio: lastWeekRunsGroupedRatio };

};

const getPerWeekRuns = ({ succesfulRunsWeekly, dateGroups }: { succesfulRunsWeekly: Run[][][], dateGroups: DateObject[] }) => {

    let perWeekRuns = succesfulRunsWeekly.map((weeklyRuns, index) => {
        // const totalAcc = weeklyRuns.reduce((acc, item) => acc += item.length, 0);
        return [`${getMMDDDate(dateGroups[index].startDate.toString())} to ${getMMDDDate(dateGroups[index].endDate.toString())}`, ...weeklyRuns.map(weeklyRunsPerGame => weeklyRunsPerGame.length)]
    });
    return [['Week', 'Succesful DS1', 'Succesful DS2', 'Succesful DS3', 'Succesful DeS', 'Succesful BB', 'Succesful SK'], ...perWeekRuns];
};
const getPerWeekRunsRatio = ({ runsWeekly, succesfulRunsWeekly, dateGroups }: { runsWeekly: Run[][][], succesfulRunsWeekly: Run[][][], dateGroups: DateObject[] }) => {

    let perWeekRunsRatio = runsWeekly.map((weeklyRuns, index) => {
        const succesfulweeklyRuns = succesfulRunsWeekly[index];
        const totalAcc = weeklyRuns.reduce((acc, item) => acc += item.length, 0);
        const succesfulTotalAcc = succesfulweeklyRuns.reduce((acc, item) => acc += item.length, 0);
        return [`${getMMDDDate(dateGroups[index].startDate.toString())} to ${getMMDDDate(dateGroups[index].endDate.toString())}`, (succesfulTotalAcc / totalAcc) * 100, ...weeklyRuns.map((weeklyRunsPerGame, perGameIndex) => {
            if (weeklyRunsPerGame.length === 0) {
                return 0;
            }
            return ((succesfulweeklyRuns[perGameIndex].length / weeklyRunsPerGame.length) * 100);
        })
        ];
    });
    return [['Week', 'Succesful Runs %', 'Succesful DS1 %', 'Succesful DS2 %', 'Succesful DS3 %', 'Succesful DeS %', 'Succesful BB %', 'Succesful SK %'], ...perWeekRunsRatio];
};

const getPerWeekData = (runs: Run[]) => {
    const weekEndDate = runs[runs.length - 1].date;
    const succesfulRuns = runs.filter(successRunFilter);

    const dateGroups: DateObject[] = createDateGroups('2021-09-20', getYYYYMMDDDate(weekEndDate));
    dateGroups.reverse();
    const succesfulRunsWeekly = createDataForGroupsPerGame(succesfulRuns, dateGroups);
    const runsWeekly = createDataForGroupsPerGame(runs, dateGroups);


    const perWeekRuns = getPerWeekRuns({ succesfulRunsWeekly, dateGroups });
    const perWeekRunsRatio = getPerWeekRunsRatio({ runsWeekly, succesfulRunsWeekly, dateGroups });

    return { perWeekRuns, perWeekRunsRatio };
}

const getCalendarData = (runs: Run[]) => {
    const succesfulRuns = runs.filter(successRunFilter);
    const dataHeader = [{ type: 'date', id: 'Date' }, { type: 'number', id: 'Sucessful runs' }];
    const succesfulRunsGroupedByDate = groupBy(succesfulRuns as [], 'date');
    const calendarData = Object.values(succesfulRunsGroupedByDate).map((perDayRuns, index) => {
        const date = Object.keys(succesfulRunsGroupedByDate)[index];

        return [new Date(date), (perDayRuns as Run[]).length];
    });
    return [dataHeader, ...calendarData];
};

const getCalendarDataRate = (runs: Run[]) => {
    const succesfulRuns = runs.filter(successRunFilter);
    const dataHeader = [{ type: 'date', id: 'Date' }, { type: 'number', id: 'Sucessful runs' }];
    const runsGroupedByDate = groupBy(runs as [], 'date');
    const succesfulRunsGroupedByDate = groupBy(succesfulRuns as [], 'date');
    const calendarData = Object.values(runsGroupedByDate).map((perDayRuns, index) => {
        const date = Object.keys(runsGroupedByDate)[index];
        const perDaySuccessfulRuns = (succesfulRunsGroupedByDate as Variant)[(date as string)];

        let ratio = calculateSuccessRate({ successfulRuns: (perDaySuccessfulRuns as Run[]), totalRuns: (perDayRuns as Run[]) });
        return [new Date(date), ratio];
    });
    return [dataHeader, ...calendarData];
};

function Visual() {
    const runContext = useContext(RunsContext);
    const runs = runContext.runs;
    if (runs.length <= 0) {
        return (<>Loading Data...</>);
    }
    const sortedRuns = runs.sort((run1, run2) => {
        if (!run1.date) {
            return -1;
        }
        if (!run2.date) {
            return 1;
        }
        return (run1.date > run2.date) ? 1 : -1
    });
    const filteredRuns = sortedRuns.filter(run => run.endSplit === undefined);

    const lastWeedData = getLastWeekData(filteredRuns);
    let lastWeekRuns, lastWeekRunsRatio;
    if (lastWeedData) {
        lastWeekRuns = lastWeedData.lastWeekRuns;
        lastWeekRunsRatio = lastWeedData.lastWeekRunsRatio;
    }

    const { perWeekRuns, perWeekRunsRatio } = getPerWeekData(filteredRuns);

    const calendarData = getCalendarData(filteredRuns);

    const calendarDataRate = getCalendarDataRate(filteredRuns);

    return (
        <>
            <div className={`${styles.statBlock}`}>
                <h2 className={styles.header2}>Global Stats</h2>
                <div style={{ display: 'flex', maxWidth: 1000, margin: 'auto' }}>
                    <Chart
                        width={1000}
                        height={200}
                        chartType="Calendar"
                        loader={<div>Loading Chart</div>}
                        data={calendarData}
                        options={{
                            title: 'Successful run per day',
                        }}
                        rootProps={{ 'data-testid': '1' }}
                    />
                </div>
                <div style={{ display: 'flex', maxWidth: 1000, margin: 'auto' }}>
                    <Chart
                        width={1000}
                        height={200}
                        chartType="Calendar"
                        loader={<div>Loading Chart</div>}
                        data={calendarDataRate}
                        options={{
                            title: 'Successful run % per day',
                        }}
                        rootProps={{ 'data-testid': '1' }}
                    />
                </div>
            </div>
            <div className={`${styles.statBlock}`}>
                <h2 className={styles.header2}>Weekly Stats</h2>
                <div style={{ display: 'flex', maxWidth: 1500, margin: 'auto' }}>
                    <Chart
                        width={1500}
                        height={400}
                        chartType="BarChart"
                        loader={<div>Loading Chart</div>}
                        data={perWeekRuns}
                        options={{
                            colors: ['#4285f3', '#DB4437', '#F4B400', '#369D57', '#AA47BC', '#41ACC0'],
                            intervals: { style: 'sticks' },
                            isStacked: true,
                            title: 'Succesful Runs per Week',
                            chartArea: { width: '70%' },
                            hAxis: {
                                title: 'Week',
                                minValue: 0,
                            },
                            vAxis: {
                                title: 'Succesful Runs',
                            },
                        }}
                    />
                </div>
                <div style={{ display: 'flex', maxWidth: 1500, height: 400, margin: 'auto' }}>
                    <Chart
                        width={1500}
                        height={400}
                        chartType="Bar"
                        loader={<div>Loading Chart</div>}
                        data={perWeekRunsRatio}
                        options={{
                            colors: ['#f37143', '#4285f3', '#DB4437', '#F4B400', '#369D57', '#AA47BC', '#41ACC0'],
                            intervals: { style: 'sticks' },
                            title: 'Succesful Runs Rate per Week',
                            chartArea: { width: '50%' },
                            hAxis: {
                                title: 'Week',
                                minValue: 0,
                            },
                            vAxis: {
                                title: 'Succesful Runs %',
                                minValue: 0,
                            },
                        }}
                    />
                </div>
            </div>
            <div className={styles.statBlock}>
                <h2 className={styles.header2}>Last Week Stats</h2>
                <div style={{ display: 'flex', maxWidth: 1000, margin: 'auto' }}>
                    <Chart
                        width={1000}
                        height={'300px'}
                        chartType="LineChart"
                        loader={<div>Loading Chart</div>}
                        data={lastWeekRuns}
                        options={{
                            legend: 'none',
                            title: 'Last Week Succesful Runs per Day',
                            chartArea: { width: '70%' },
                            hAxis: {
                                title: 'Day',
                                minValue: 0,
                            },
                            vAxis: {
                                title: 'Succesful Runs',
                                minValue: 0,
                            },
                        }}
                    />
                </div>
                <div style={{ display: 'flex', maxWidth: 1000, margin: 'auto' }}>
                    <Chart
                        width={1000}
                        height={'300px'}
                        chartType="LineChart"
                        loader={<div>Loading Chart</div>}
                        data={lastWeekRunsRatio}
                        options={{
                            legend: 'none',
                            title: 'Last Week Succesful Rate per Day',
                            chartArea: { width: '70%' },
                            hAxis: {
                                title: 'Day',
                                minValue: 0,
                            },
                            vAxis: {
                                title: 'Succesful Runs %',
                                minValue: 0,
                            },
                        }}
                    />
                </div>
            </div>
        </>
    );


}

export default Visual;
