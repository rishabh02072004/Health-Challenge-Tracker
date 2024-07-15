import { AfterViewInit, Component, ElementRef, Inject, model } from '@angular/core';
import { AppService } from '../app.service';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT } from '@angular/common';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements AfterViewInit {
  userData: any = [];

  workouts: any = ['Meditation', 'Yoga'];
  chartType = 'bar';
  chartData: any = [
    { labeldata: 'Running', realdata: 25, colordata: 'red' },
    { labeldata: 'Yoga', realdata: 50, colordata: 'green' },
  ];
  public isBrowser: boolean;

  userDropdown: any = [];
  userChartData: any = {};
  selectedUser;
  chart: any;
  colors: any = [
    '#9CDBA6',
    '#5DEBD7',
    '#C5FF95',
    '#FC819E',
    '#B1AFFF',
    '#FFE9D0',
    '#5BBCFF',
  ];

  constructor(
    @Inject(DOCUMENT) document: Document,
    @Inject(PLATFORM_ID) platformId: Object,
    private appService: AppService,
    private elementRef: ElementRef
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    const localStorage = document.defaultView?.localStorage;
    this.appService.userDataList$.subscribe((res: any) => {
      this.userData = res;
    });

    if (!this.userData.length && localStorage) {
      const ust: any = localStorage.getItem('userData');
      this.userData = JSON.parse(ust);
    }

    this.userData.forEach((user: any, index: any) => {
      this.userChartData[user.name] = { label: [], data: [] };
      user.workouts.forEach((w: any, ci: any) => {
        this.userChartData[user.name].label.push(w.type);
        this.userChartData[user.name].data.push(w.minutes);
      });

    });
    this.userDropdown = Object.keys(this.userChartData);
    this.selectedUser = this.userDropdown[0];
  }

  ngAfterViewInit() {
    this.renderChart();
  }


  renderChart() {
    this.chart?.destroy();
    let htmlRef = this.elementRef.nativeElement
      .querySelector(`#chartsss`);

    this.chart = new Chart(htmlRef, {
      type: 'bar',
      data: {
        labels: this.userChartData[this.selectedUser]?.label,
        datasets: [
          {
            label: 'Workouts',
            data: this.userChartData[this.selectedUser]?.data,
            backgroundColor: this.colors,
          },
        ],
      },
    });
  }
}
