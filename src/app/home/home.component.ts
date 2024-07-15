import { ChangeDetectionStrategy, Component, Inject, inject, model, signal } from '@angular/core';
import { AppService } from '../app.service';
import { CommonModule, DOCUMENT } from '@angular/common';

import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';

interface Workout {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  searchUser = '';
  filterWorkout = '';
  defaultUserList: any = [
    {
      id: 1,
      name: 'John Doe',
      workouts: [
        { type: 'Running', minutes: 30 },
        { type: 'Cycling', minutes: 45 },
      ],
    },
    {
      id: 2,
      name: 'Jane Smith',
      workouts: [
        { type: 'Swimming', minutes: 60 },
        { type: 'Running', minutes: 20 },
      ],
    },
    {
      id: 3,
      name: 'Mike Johnson',
      workouts: [
        { type: 'Yoga', minutes: 50 },
        { type: 'Cycling', minutes: 40 },
      ],
    },
  ];

  workouts: Workout[] = [
    { value: '', viewValue: 'All' },
    { value: 'Meditation', viewValue: 'Meditation' },
    { value: 'yoga', viewValue: 'Yoga' },
    { value: 'running', viewValue: 'Running' },
    { value: 'cycling', viewValue: 'Cycling' },
    { value: 'swimming', viewValue: 'Swimming' },
  ];

  filterdListData = model(this.defaultUserList);
  dialog = inject(MatDialog);

  addForm = signal('');
  // addWorkoutData = signal('');
  // addMinutes = signal('')

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private appService: AppService
  ) {
    const localStorage = document.defaultView?.localStorage;
    if (localStorage) {
      const users: any = localStorage.getItem('userData');

      console.log(JSON.parse(users)?.length)
      if (JSON.parse(users)?.length) {
        this.appService.userDataList$.next(JSON.parse(users));
      } else {
        localStorage.setItem('userData', JSON.stringify(this.defaultUserList));
        this.appService.userDataList$.next(this.defaultUserList);
      }
    }

    this.appService.userDataList$.subscribe((userlist) => {
      this.defaultUserList = userlist;
      this.filterdListData.set(userlist);
      localStorage?.setItem('userData', JSON.stringify(userlist));
    });
  }

  ngOnInit() {
  }

  getWorkout(workouts: any) {
    return workouts.map((w: any) => w.type);
  }

  calculateMinute(workouts: any) {
    let minutes = 0;
    workouts.map((w: any) => (minutes += w.minutes));
    return minutes;
  }

  handleChangeWorkout() {
    if (this.searchUser || this.filterWorkout) {
      const filtered = this.defaultUserList.filter((user: any) => {
        let activity = true;
      
        const ex = user.workouts.filter((w: any) => w.type == this.filterWorkout);
        if(!ex.length) activity = false;
        return user.name.toLowerCase().startsWith(this.searchUser.toLowerCase()) && activity;
      });

      this.filterdListData.set(filtered);
    } else {
      this.filterdListData.set(this.defaultUserList);
    }
  }

  addWorkout() {
    const dialogRef = this.dialog.open(AddWorkoutDialog, {
      data: {
        formData: this.addForm(),
        workouts: this.workouts,
        users: this.defaultUserList,
      },
    });

    let isUpdate = false;
    dialogRef.afterClosed().subscribe((result) => {
      if(result) {
        let updateArr: any;
        const isUserExist = this.defaultUserList.filter((u: any) => u.name.toLowerCase() == result.name.toLowerCase());
        if(isUserExist.length) {
          updateArr = this.defaultUserList.map((u:any) => {
            if( u.name.toLowerCase() == result.name.toLowerCase()) {
              u.workouts.push(result.workouts[0]);
            }
            return u;
          });

        } else {
          updateArr = [...this.defaultUserList, result];
        }
        this.appService.userDataList$.next(updateArr);
      }

      // if (result !== undefined) {
      //   // this.defaultUserList.map((u: any) => {
      //   //   if(u.name.toLowerCase() == result.name.toLowerCase) {
      //   //     isUpdate = true;
      //   //     u.workouts.push(result.workouts[0]);
      //   //   }
      //   // });
      //   // console.log(this.defaultUserList);

      //   let updateArr: any;
      //   if (isUpdate) {
      //     updateArr = JSON.parse(JSON.stringify(this.defaultUserList));
      //   } else {
      //     this.defaultUserList.push(result);
      //     isUpdate = JSON.parse(
      //       JSON.stringify([...this.defaultUserList, result])
      //     );
      //   }
      //   // this.appService.userDataList$.next(updateArr);
      //   this.filterdListData.set(updateArr);
      //   localStorage.setItem(
      //     'userData',
      //     JSON.stringify(this.defaultUserList)
      //   );
      // }
    });

    this.filterWorkout = '';
    this.searchUser = '';
  }
}

import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface Workout {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'add-workout-dialog',
  templateUrl: 'add-workout-dialog.html',
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
  ],
})
export class AddWorkoutDialog {
  readonly dialogRef = inject(MatDialogRef<AddWorkoutDialog>);
  readonly data = inject<any>(MAT_DIALOG_DATA);
  readonly addUser = model('');
  readonly workout = model(null);
  readonly minutes = model(this.data.minutes);
  readonly workouts: Workout[] = this.data.workouts.filter((w: Workout) => w.value);
  form = model(this.data.formData);
  errmsg = model('');

  handleBtn() {
    this.errmsg.set('');
    const data = {
      id: this.data.users.length + 1,
      name: this.addUser(),
      workouts: [{
        type: this.workout(),
        minutes: this.minutes()
      }]
    };

    const userExist = this.data.users.filter((u: any) => u.name.toLowerCase() == data.name.toLowerCase());

    if(userExist.length) {
      const workoutEx = userExist[0].workouts.filter((w: any) => w.type === this.workout());
      if(workoutEx.length) {
        this.errmsg.set("User already performing the same workout");
      }
    }
    if(!this.errmsg()) this.dialogRef.close(data);
  }
}

