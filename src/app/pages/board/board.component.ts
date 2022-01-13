import { Priority } from './../../shared/enums/Priority';
import { StoryType } from './../../shared/enums/StoryType';
import { IssuesService } from './../../shared/services/issues.service';
import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Issue } from 'src/app/shared/interfaces/Project';
import { MenuItem, MessageService, SelectItem } from 'primeng/api';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  fromEvent,
  Subject,
  tap,
} from 'rxjs';
import { User } from 'src/app/shared/interfaces/user.model';
import { StoryStatus } from 'src/app/shared/enums/StoryStatus';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { ObjectID } from 'bson';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
})
export class BoardComponent implements OnInit, AfterViewInit {
  public title = 'Design System';

  public autoResize: boolean = true;

  public property =
    "I wanted to introduce you my latest application: Angular Spotify.It is a simple Spotify client built with Angular 11, Nx workspace, ngrx, TailwindCSS and ng-zorro.Check out the live application -> https://spotify.trungk18.com.Source code: https://github.com/trungk18/angular-spotify.Spotify premium is required for the Web Playback SDK to play music. If you are using a free account, you can still browse the app, but it couldn't play the music. Sorry about that";

  @ViewChild('input') input: ElementRef = {} as ElementRef;
  public items: MenuItem[] = [];

  public home: any;

  public toDo: Issue[] = [];
  public functionalReview: Issue[] = [];
  public inProgress: Issue[] = [];
  public qa: Issue[] = [];
  public blocked: Issue[] = [];
  public done: Issue[] = [];
  public userAvatarList: User[] = [];
  public selectedUsers: User[] = [];

  public totalArr: Issue[] = [];

  public terms$ = new Subject<string>();
  public isCollapsed: boolean = false;

  /**
   * Form for create issue
   */
  public createIssueForm!: FormGroup;

  /**
   * Dropdowns
   */
  public statusOptions: SelectItem[] = [
    { label: 'To Do', value: StoryStatus.TODO },
    { label: 'In Progress', value: StoryStatus.IN_PROGRESS },
    { label: 'Functional Review', value: StoryStatus.FUNCTIONAL_REVIEW },
    { label: 'Done', value: StoryStatus.DONE },
  ];

  public assigneeOptions: SelectItem[] = [{ label: '', value: null }];
  public priorityOptions: SelectItem[] = [
    { label: Priority.LOW, value: Priority.LOW },
    { label: Priority.HIGH, value: Priority.HIGH },
    { label: Priority.MEDIUM, value: Priority.MEDIUM },
  ];

  public countries: SelectItem[] = [
    { label: 'Unassigned', value: 'Unassigned' },
  ];

  public storyTypeOptions: SelectItem[] = [
    { label: 'Bug', value: StoryType.Bug },
    {
      label: 'Spike',
      value: StoryType.Spike,
    },
    {
      label: 'Task',
      value: StoryType.Task,
    },
    {
      label: 'Story',
      value: StoryType.Story,
    },
  ];

  public storyPointOptions: SelectItem[] = [
    {
      label: '2',
      value: 2,
    },
    {
      label: '8',
      value: 8,
    },
    {
      label: '5',
      value: 5,
    },
    {
      label: '13',
      value: 13,
    },
    {
      label: '21',
      value: 21,
    },
  ];
  public selectedStatus!: any;
  public selectedAssignee!: any;
  public selectedPriority!: any;
  public dialogItem!: any;

  /**
   * Dialog
   */
  public displayModal: boolean = false;
  public selectedTitle: string = '';

  public displayCreateIssueModal: boolean = false;
  public isSubmitted: boolean = false;
  public isLoading: boolean = true;
  public isUserListLoading: boolean = true;

  constructor(
    private issueService: IssuesService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.populateMemberIssues();
    this.createIssueForm = new FormGroup({
      title: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      priority: new FormControl(null, Validators.required),
      assignee: new FormControl(null, Validators.required),
      type: new FormControl(null, Validators.required),
      storypoint: new FormControl(null, Validators.required),
    });

    this.items = [
      { label: 'Projects' },
      { label: 'Jira' },
      { label: 'Design System' },
    ];
  }

  public onSubmit(form: FormGroup) {
    this.isSubmitted = true;
    if (!this.createIssueForm.valid) {
      return;
    }
    let issueObj = {
      name: form.value.title,
      description: form.value.description,
      assignee: form.value.assignee.value,
      priority: form.value.priority.value,
      status: StoryStatus.TODO,
      projectname: 'Design System',
      title: form.value.title,
      summary: form.value.description,
      type: form.value.type.value,
      storypoint: form.value.storypoint.value,
      id: new ObjectID().toString(),
    };
    this.displayCreateIssueModal = false;
    this.createIssueForm.reset();
    this.isSubmitted = false;
    this.issueService.createNewIssue(issueObj).subscribe((res) => {
      this.populateMemberIssues();
      this.messageService.add({
        severity: 'success',
        summary: 'New Issue has been added',
      });
    });
  }

  public resetCloseDialog() {
    this.createIssueForm.reset();
    this.displayCreateIssueModal = false;
    this.isSubmitted = false;
  }

  /**
   * Populate member from issues
   * @param void
   * @returns void
   */
  public populateMemberIssues() {
    this.isLoading = true;
    this.userAvatarList = [];
    this.countries = [];
    this.countries = [{ label: 'Unassigned', value: 'Unassigned' }];
    this.totalArr = [];
    this.issueService.getIssues().subscribe((res) => {
      this.totalArr = res;
      this.generateList(res);
      this.isLoading = false;
    });
    this.issueService.getMember().subscribe((res) => {
      res.forEach((element, index) => {
        let n: string[] = [];
        n = element.name.split(' ');
        this.assigneeOptions.push({ label: element.name, value: element.name });
        this.userAvatarList.push({
          id: element.id,
          firstName: n[0],
          lastName: n[n.length - 1],
          avatarUrl: this.appendUrl(index),
        });
      });
      this.assigneeOptions.splice(0, 1);
      this.userAvatarList.forEach((user) => {
        this.countries.push({
          label: user.firstName + ' ' + user.lastName,
          value: user.firstName + ' ' + user.lastName,
        });
      });
      this.isUserListLoading = false;
    });
  }

  /**
   * Opens dialog
   * @param item
   */
  public openDialog(item: any) {
    this.dialogItem = item;
    this.property = item.description;
    this.selectedTitle = item.title;
    this.selectedPriority = { label: item.priority, value: item.priority };
    this.selectedAssignee = { label: item.assignee, value: item.assignee };
    this.selectedStatus = { label: item.status, value: item.status };
    this.displayModal = true;
  }

  public openCreateIssueModal() {
    this.displayCreateIssueModal = true;
  }

  /**
   * Save issue based on id
   * @param void
   * @returns void
   */
  public saveIssueDetail(): void {
    let dialogItem = {
      ...this.dialogItem,
      status: this.selectedStatus.value,
      proiority: this.selectedPriority.value,
      assignee: this.selectedAssignee.value,
    };
    this.issueService
      .editIssueById(dialogItem.id, dialogItem)
      .subscribe((res) => {
        if (res) {
          this.populateMemberIssues();
          this.messageService.add({
            severity: 'success',
            summary: `The issue ${dialogItem.title} is modified`,
          });
          this.displayModal = false;
        }
      });
  }

  /**
   * Fetch avatar image from assignee for card display
   * @param assignee
   * @returns
   */
  public fetchAvatarFromAssignee(assignee: string): any {
    let url;
    this.userAvatarList.forEach((user: User) => {
      if (user.firstName && assignee.includes(user.firstName)) {
        url = user.avatarUrl;
      }
    });
    return url;
  }

  /**
   * Generate images dynamically
   * @param index
   * @returns
   */
  public appendUrl(index: number): string {
    if (index === 0) {
      return 'assets/images/avatar1.png';
    }
    if (index === 1) {
      return 'assets/images/avatar2.png';
    }
    if (index % 3 === 0) {
      return 'assets/images/avatar3.png';
    }
    if (index % 4 === 0 && index > 2) {
      return 'assets/images/avatar4.png';
    } else {
      return 'assets/images/avatar4.png';
    }
  }

  /**
   * Switch the priority dropdown
   * @param priority
   * @returns
   */
  public getPriority(priority: string) {
    switch (priority) {
      case 'High': {
        return 'High';
      }
      case 'Low': {
        return 'Low';
      }
      case 'Medium': {
        return 'Medium';
      }
      default: {
        return '';
      }
    }
  }

  /**
   * Render stories based on avatar
   * @param event
   */
  public useAvatarSelectionFilter(event: any) {
    let tempArr: User[] = [];
    event.forEach((ele: User) => {
      let a = ele as any;
      tempArr.push(a.firstName);
    });
    this.issueService.getSpecificMember(tempArr).subscribe((res) => {
      /**
       * Getting the correct data;
       */
      let finalNames = [];
      for (let i = 0; i < res.length; i++) {
        finalNames.push(res[i].name);
      }
      let fList: Issue[] = [];
      for (let j = 0; j < finalNames.length; j++) {
        let element = finalNames[j];
        this.totalArr.forEach((arrElement) => {
          if (arrElement.assignee.includes(element)) {
            fList.push(arrElement);
          }
        });
      }
      this.generateList(fList);
    });
  }

  /**
   * Generate the list based on backend
   * @param res
   */
  public generateList(res: Issue[]) {
    this.toDo = res.filter((result) => result.status === StoryStatus.TODO);
    this.functionalReview = res.filter(
      (result) => result.status === StoryStatus.FUNCTIONAL_REVIEW
    );
    this.inProgress = res.filter(
      (result) => result.status === StoryStatus.IN_PROGRESS
    );
    this.done = res.filter((result) => result.status === StoryStatus.DONE);
  }

  /**
   * Delete issue
   */
  public deleteIssue() {
    this.issueService
      .deleteIssueFromList(this.dialogItem.id)
      .subscribe((res) => {
        if (res) {
          this.populateMemberIssues();
          this.messageService.add({
            severity: 'success',
            summary: `Issue - ${this.dialogItem.title} is deleted`,
          });
          this.displayModal = false;
        }
      });
  }

  /**
   * Search functionalities
   */
  public ngAfterViewInit(): void {
    fromEvent(this.input.nativeElement, 'keyup')
      .pipe(
        filter(Boolean),
        debounceTime(400),
        distinctUntilChanged(),
        tap((text) => {
          this.issueService
            .getStartingWithIssues(this.input.nativeElement.value)
            .subscribe((res) => {
              this.totalArr = res;
              this.generateList(res);
            });
          // Backend call for getting issues that starts with a particular word.
        })
      )
      .subscribe();
  }

  /**
   * Drag and drop
   * @param event
   */
  public drop(event: any) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      let x = event.previousContainer.data[event.previousIndex];
      switch (event.container.id) {
        case StoryStatus.TODO: {
          x.status = StoryStatus.TODO;
          break;
        }
        case StoryStatus.DONE: {
          x.status = StoryStatus.DONE;
          break;
        }
        case StoryStatus.FUNCTIONAL_REVIEW: {
          x.status = StoryStatus.FUNCTIONAL_REVIEW;
          break;
        }
        case StoryStatus.IN_PROGRESS: {
          x.status = StoryStatus.IN_PROGRESS;
          break;
        }
      }
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      this.issueService.editIssues(x.id, x).subscribe((res) => {});
    }
  }

  /**
   * Navigation style update
   * @param event
   */
  public updateStyleForNav(event: boolean) {
    this.isCollapsed = event;
  }
}
