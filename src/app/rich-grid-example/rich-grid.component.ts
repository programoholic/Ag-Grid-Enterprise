import {Component, ViewEncapsulation} from "@angular/core";
import {GridOptions} from "ag-grid/main";

import ProficiencyFilter from '../filters/proficiencyFilter';
import SkillFilter from '../filters/skillFilter';
import RefData from '../data/refData';

// only import this if you are using the ag-Grid-Enterprise
import 'ag-grid-enterprise/main';

import {HeaderGroupComponent} from "../header-group-component/header-group.component";
import {DateComponent} from "../date-component/date.component";
import {HeaderComponent} from "../header-component/header.component";
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'rich-grid',
    templateUrl: 'rich-grid.component.html',
    styleUrls: ['rich-grid.css', 'proficiency-renderer.css'],
    encapsulation: ViewEncapsulation.None
})
export class RichGridComponent {

    public gridOptions:GridOptions;
    private gridApi;
    public showGrid:boolean;
    public rowData:any[];
    private columnDefs:any[];
    public rowCount:string;
    public dateComponentFramework:DateComponent;
    public HeaderGroupComponent = HeaderGroupComponent;
    public showToolPanel:boolean;

    constructor( 
        private toastr: ToastrService
    ) {

       
        // we pass an empty gridOptions in, so we can grab the api out
        this.gridOptions = <GridOptions>{};
        this.createRowData();
        this.createColumnDefs();
        this.showGrid = true;
        this.gridOptions.dateComponentFramework = DateComponent;
        this.gridOptions.defaultColDef = {
            headerComponentFramework : <{new():HeaderComponent}>HeaderComponent,
            headerComponentParams : {
                menuIcon: 'fa-bars'
            }
        }
    }

    onGridReady(params) {
        this.gridApi = params.api;
    }
    public createRowData() {
        var rowData:any[] = [];

        for (var i = 0; i < 200; i++) {
            var countryData = RefData.countries[i % RefData.countries.length];
            rowData.push({
                name: RefData.firstNames[i % RefData.firstNames.length] + ' ' + RefData.lastNames[i % RefData.lastNames.length],
                skills: {
                    android: Math.random() < 0.4,
                    html5: Math.random() < 0.4,
                    mac: Math.random() < 0.4,
                    windows: Math.random() < 0.4,
                    css: Math.random() < 0.4
                },
                dob: RefData.DOBs[i % RefData.DOBs.length],
                address: RefData.addresses[i % RefData.addresses.length],
                years: Math.round(Math.random() * 100),
                proficiency: Math.round(Math.random() * 100),
                country: countryData.country,
                continent: countryData.continent,
                language: countryData.language,
                mobile: createRandomPhoneNumber(),
                landline: createRandomPhoneNumber()
            });
        }

        this.rowData = rowData;
    }

    private createColumnDefs() {
        this.columnDefs = [
            {
                headerName: '#', width: 30, checkboxSelection: true, suppressSorting: true,
                suppressMenu: true, pinned: true
            },
            {
                headerName: 'Employee',
                headerGroupComponentFramework: HeaderGroupComponent,
                children: [
                    {
                        headerName: "Name", field: "name",
                        width: 150, pinned: true
                    },
                    {
                        headerName: "Country", field: "country", width: 150,
                        cellRenderer: countryCellRenderer, pinned: true,
                        filterParams: {cellRenderer: countryCellRenderer, cellHeight: 20}, columnGroupShow: 'open'
                    },
                    {
                        headerName: "DOB", field: "dob", width: 120, pinned: true, cellRenderer: function(params) {
                        return  pad(params.value.getDate(), 2) + '/' +
                            pad(params.value.getMonth() + 1, 2)+ '/' +
                            params.value.getFullYear();
                        }, filter: 'date', columnGroupShow: 'open'
                    }
                ]
            },
            {
                headerName: 'IT Skills',
                children: [
                    {
                        headerName: "Skills",
                        width: 125,
                        suppressSorting: true,
                        cellRenderer: skillsCellRenderer,
                        filter: SkillFilter
                    },
                    {
                        headerName: "Proficiency",
                        field: "proficiency",
                        width: 120,
                        cellRenderer: percentCellRenderer,
                        filter: ProficiencyFilter
                    },
                ]
            },
            {
                headerName: 'Contact',
                children: [
                    {headerName: "Mobile", field: "mobile", width: 150, filter: 'text'},
                    {headerName: "Land-line", field: "landline", width: 150, filter: 'text',cellRenderer: function(params) {
                        return '<a href="#">'+ params.value+'</a>'
                    }},
                    {headerName: "Address", field: "address", width: 500, filter: 'text'}
                ]
            }
        ];
    }

    private calculateRowCount() {
        if (this.gridOptions.api && this.rowData) {
            var model = this.gridOptions.api.getModel();
            var totalRows = this.rowData.length;
            var processedRows = model.getRowCount();
            this.rowCount = processedRows.toLocaleString() + ' / ' + totalRows.toLocaleString();
        }
    }

    private onModelUpdated() {
       this.toastr.info('onModelUpdated');
        this.calculateRowCount();
    }

    public onReady() {
       this.toastr.info('onReady');
        this.toastr.success('Perform operations', ' Grid Initialized!');
        this.calculateRowCount();
    }

    private onCellClicked($event) {
        this.toastr.info('onCellClicked: ' + $event.rowIndex + ' ' + $event.colDef.field+' ');
    }

    private onCellValueChanged($event) {
       this.toastr.info('onCellValueChanged: ' + $event.oldValue + ' to ' + $event.newValue);
    }

    private onCellDoubleClicked($event) {
       this.toastr.info('onCellDoubleClicked: ' + $event.rowIndex + ' ' + $event.colDef.field);
    }

    private onCellContextMenu($event) {
       this.toastr.info('onCellContextMenu: ' + $event.rowIndex + ' ' + $event.colDef.field);
    }

    private onCellFocused($event) {
       this.toastr.info('onCellFocused: (' + $event.rowIndex + ',' + $event.colIndex + ')');
    }

    private onRowSelected($event) {
        // taking out, as when we 'select all', it prints to much to the console!!
        //this.toastr.info('onRowSelected: ' + $event.node.data.name);
    }

    private onSelectionChanged() {
       this.toastr.info('selectionChanged');
    }

    private onBeforeFilterChanged() {
       this.toastr.info('beforeFilterChanged');
    }

    private onAfterFilterChanged() {
       this.toastr.info('afterFilterChanged');
    }

    private onFilterModified() {
       this.toastr.info('onFilterModified');
    }

    private onBeforeSortChanged() {
       this.toastr.info('onBeforeSortChanged');
    }

    private onAfterSortChanged() {
       this.toastr.info('onAfterSortChanged');
    }

    private onVirtualRowRemoved($event) {
        // because this event gets fired LOTS of times, we don't print it to the
        // console. if you want to see it, just uncomment out this line
        //this.toastr.info('onVirtualRowRemoved: ' + $event.rowIndex);
    }

    private onRowClicked($event) {
       this.toastr.info('onRowClicked: ' + $event.node.data.name);
    }

    public onQuickFilterChanged($event) {
        this.gridOptions.api.setQuickFilter($event.target.value);
    }

    // here we use one generic event to handle all the column type events.
    // the method just prints the event name
    private onColumnEvent($event) {
       this.toastr.info('onColumnEvent: ' + $event);
    }

    onBtExport() {
        var params = {
          skipHeader: getBooleanValue("#skipHeader"),
          columnGroups: getBooleanValue("#columnGroups"),
          skipFooters: getBooleanValue("#skipFooters"),
          skipGroups: getBooleanValue("#skipGroups"),
          skipPinnedTop: getBooleanValue("#skipPinnedTop"),
          skipPinnedBottom: getBooleanValue("#skipPinnedBottom"),
          allColumns: getBooleanValue("#allColumns"),
          onlySelected: getBooleanValue("#onlySelected"),
          fileName: document.querySelector("#fileName")["value"],
          sheetName: document.querySelector("#sheetName")["value"],
          exportMode: document.querySelector('input[name="mode"]:checked')["value"]
        };
       
        this.gridApi.exportDataAsExcel(params);
      }
    
}

function skillsCellRenderer(params) {
    var data = params.data;
    var skills = [];
    RefData.IT_SKILLS.forEach(function (skill) {
        if (data && data.skills && data.skills[skill]) {
            skills.push('<img src="images/skills/' + skill + '.png" width="16px" title="' + skill + '" />');
        }
    });
    return skills.join(' ');
}

function countryCellRenderer(params) {
    var flag = "<img border='0' width='15' height='10' style='margin-bottom: 2px' src='images/flags/" + RefData.COUNTRY_CODES[params.value] + ".png'>";
    return flag + " " + params.value;
}

function createRandomPhoneNumber() {
    var result = '+';
    for (var i = 0; i < 12; i++) {
        result += Math.round(Math.random() * 10);
        if (i === 2 || i === 5 || i === 8) {
            result += ' ';
        }
    }
    return result;
}

function percentCellRenderer(params) {
    var value = params.value;

    var eDivPercentBar = document.createElement('div');
    eDivPercentBar.className = 'div-percent-bar';
    eDivPercentBar.style.width = value + '%';
    if (value < 20) {
        eDivPercentBar.style.backgroundColor = 'red';
    } else if (value < 60) {
        eDivPercentBar.style.backgroundColor = '#ff9900';
    } else {
        eDivPercentBar.style.backgroundColor = '#00A000';
    }

    var eValue = document.createElement('div');
    eValue.className = 'div-percent-value';
    eValue.innerHTML = value + '%';

    var eOuterDiv = document.createElement('div');
    eOuterDiv.className = 'div-outer-div';
    eOuterDiv.appendChild(eValue);
    eOuterDiv.appendChild(eDivPercentBar);

    return eOuterDiv;
}

//Utility function used to pad the date formatting.
function pad(num, totalStringSize) {
    let asString = num + "";
    while (asString.length < totalStringSize) asString = "0" + asString;
    return asString;
}

function getBooleanValue(cssSelector) {
    return document.querySelector(cssSelector).checked === true;
  }