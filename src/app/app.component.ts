import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from './app.service';
import { MediaMatcher } from '@angular/cdk/layout';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  //Sidenav Properties
  showHamburgerMenuOnDesktopView: boolean = false;
  sidenavStatus: any;

  //Mobile Width
  mobileQuery: any;
  _mobileQueryListener: any;

  url = '';

  constructor(
    private appService: AppService,
    private changeDetectorRef: ChangeDetectorRef,
    private media: MediaMatcher,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.showHamburgerMenuOnDesktopView =
      this.appService.showHamburgerMenuOnDesktopView;
    //Updating the state using behaviour subject
    this.appService.sidebarStatus$.subscribe(
      (status) => (this.sidenavStatus = status)
    );

    //Code here for knowing whether the screen is mobile or desktop
    this.mobileQuery = this.media.matchMedia('(max-width: 768px)');
    this._mobileQueryListener = () => {
      //Open sidenav for desktop
      if (!this.mobileQuery.matches) {
        this.appService.sidebarStatus$.next(true);
      }

      return this.changeDetectorRef.detectChanges();
    };
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.router.events.subscribe((val) => {
      this.url = this.router.url;
    });
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  onMenuClick() {
    this.appService.sidebarStatus$.next(!this.sidenavStatus);
  }

  onSidenavLinkClick() {
    if (this.mobileQuery.matches) {
      this.appService.sidebarStatus$.next(false);
    }
  }

  handleLogout() {
    localStorage.setItem('token', '');
    this.router.navigateByUrl('/');
  }

  reset() {
    localStorage.removeItem('userData');
    window.location.reload();
  }
}
