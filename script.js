var dataRows = [];
var occupiedBarColor = '#E46C7E'
var freeBarColor = '#94e4f7'
var monthDictonary = {
    0: 'Jan',
    1: 'Feb',
    2: 'Mar',
    3: 'Apr',
    4: 'May',
    5: 'Jun',
    6: 'Jul',
    7: 'Aug',
    8: 'Sep',
    9: 'Oct',
    10: 'Nov',
    11: 'Dec'
}
// fetching JSON data from server using xhr call within AJAX and display in table 
$.ajax({
    type: 'GET',
    url: 'https://totalcloud-static.s3.amazonaws.com/intern.json',
    data: {
        get_param: 'value'
    },
    dataType: 'json',
    success: function (data) {
        $.each(data, function (key, value) {
            var id = value.id - 1
            var startDate = toDate(value.start)
            var endDate = toDate(value.end)
            data += '<tr>';
            data += '<td>' + id + '</td>';
            data += '<td>' + value.name + '</td>';
            data += '<td>' + formatDateObjectToString(startDate) + '</td>';
            data += '<td>' + formatDateObjectToString(endDate) + '</td>';
            data += '</tr>';
            dataRows.push([id.toString(), value.name, value.name, occupiedBarColor, startDate, endDate]);
        });
        $('#intern_table').append(data);
    }
});
//converts date string to date object
function toDate(dateStr) {
    var parts = dateStr.split("/")
    return new Date(parts[2], parts[1] - 1, parts[0])
}
//converts date into dd/monthName 
function formatDateObjectToString(dateObj) {
    var day = dateObj.getDate()
    if (day < 10) {
        day = "0" + day
    }
    var month = dateObj.getMonth()
    return day + "/" + monthDictonary[month]
}


google.charts.load('current', {
    'packages': ['timeline']
});
google.charts.setOnLoadCallback(drawChart, false);
// using google timechart to display the schedule and availablity 
function drawChart(checkAvailability) {
    var container = document.getElementById('timeline');
    var chart = new google.visualization.Timeline(container);
    var dataTable = new google.visualization.DataTable();

    dataTable.addColumn({
        type: 'string',
        id: 'id'
    });
    dataTable.addColumn({
        type: 'string',
        id: 'name'
    });
    dataTable.addColumn({
        type: 'string',
        role: 'tooltip'
    });
    dataTable.addColumn({
        type: 'string',
        id: 'style',
        role: 'style'
    });
    dataTable.addColumn({
        type: 'date',
        id: 'Start'
    });
    dataTable.addColumn({
        type: 'date',
        id: 'End'
    });
    dataTable.addRows(dataRows)

    if (checkAvailability) {
        var freeTimeSlots = calculateFreeTimeSlots(dataRows)
        dataTable.addRows(freeTimeSlots)
        document.getElementById("btn1").disabled = true;

    }

    var options = {
        height: 700,
        timeline: {
            showRowLabels: false
        }

    };
    chart.draw(dataTable, options);
}
// sort all the given start and end time in ascending order in a single array,
// maintain a start and end counter, whenever they are equal and non-zero,
// that means last end time is the start time of free slot and 
// next start time is the end time of free slot  
// and this is how we calculate free time slots and display in chart. 
function calculateFreeTimeSlots(dataRows) {
    var totalRows = dataRows.length
    var checkPoints = []
    var freeSlotDataRows = []
    for (index = 0; index < totalRows; index++) {
        var row = dataRows[index]
        checkPoints.push({
            "time": row[4],
            "type": "start"
        })
        checkPoints.push({
            "time": row[5],
            "type": "end"
        })
    }
    checkPoints.sort(function (a, b) {
        return new Date(a.time) - new Date(b.time);
    });

    var startCounter = 0
    var endCounter = 0
    for (index = 0; index < 2 * totalRows; index++) {
        if ((startCounter - endCounter === 0) && (startCounter + endCounter !== 0)) {
            freeSlotStartTime = checkPoints[index - 1].time
            freeSlotEndTime = checkPoints[index].time
            if (freeSlotStartTime.getTime() !== freeSlotEndTime.getTime()) {
                freeSlotDataRows = freeSlotDataRows.concat(populateFreeDataSlotRows(freeSlotStartTime, freeSlotEndTime, totalRows))
            }
        }
        if (checkPoints[index].type === "start") {
            ++startCounter
        } else {
            ++endCounter
        }
    }

    var lastDateEntry = checkPoints[2 * totalRows - 1].time
    var lastDateOfMonth = getLastDateOfMonth(lastDateEntry.getFullYear(), lastDateEntry.getMonth())

    if (lastDateEntry.getTime() !== lastDateOfMonth.getTime()) {
        freeSlotDataRows = freeSlotDataRows.concat(populateFreeDataSlotRows(lastDateEntry, lastDateOfMonth, totalRows))
    }
    return freeSlotDataRows
}
//add free slot data to chart for given free start and free end time
function populateFreeDataSlotRows(freeSlotStartTime, freeSlotEndTime, totalRows) {
    var populateDataRows = []
    for (i = 0; i < totalRows; i++) {
        populateDataRows.push([i.toString(), "", "free", freeBarColor, freeSlotStartTime, freeSlotEndTime])
    }
    return populateDataRows
}
// finding last date of a month
function getLastDateOfMonth(y, m) {
    return new Date(y, m + 1, 0);
}
// reloading the page
function refreshPage() {
    location.reload();
}