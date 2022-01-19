import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { User } from 'src/app/shared/interfaces/user.model';

@Component({
  selector: 'app-avatars-widget',
  templateUrl: './avatars-widget.component.html',
})
export class AvatarsWidgetComponent implements OnInit {
  @Input()
  public users: User[] = [];
  @Input()
  public visibleAvatarCount: number = 5;
  @Input()
  public selection: User[] = [];
  @Output()
  public selectionChange = new EventEmitter<User[]>();

  public get usersVisible(): User[] {
    if (this.users?.length > this.visibleAvatarCount) {
      return this.users.slice(0, this.visibleAvatarCount);
    }
    return this.users;
  }

  public get nonVisibleUsers(): User[] {
    if (this.users?.length > this.visibleAvatarCount) {
      return this.users?.slice(this.visibleAvatarCount);
    }
    return this.users;
  }

  public get nonVisibleAvatarCount(): number {
    return this.users?.length > this.visibleAvatarCount
      ? this.users?.length - this.visibleAvatarCount
      : 0;
  }

  public getInitialsOfUser(user: User): string {
    return user?.firstName!.substring(0, 1) + user?.lastName?.substring(0, 1);
  }

  public isUserSelected(user: User): boolean {
    if (!this.selection) {
      return false;
    }
    return !!this.selection.find((currentUser) => currentUser.id === user.id);
  }

  public toggleUserSelection(user: User): void {
    if (!this.selection) this.selection = [];
    const currentUserSelectionIndex = this.selection.findIndex(
      (currentUser) => currentUser.id === user.id
    );
    if (currentUserSelectionIndex !== -1) {
      this.selection.splice(currentUserSelectionIndex, 1);
    } else {
      this.selection.push(user);
    }
    this.selectionChange.emit(this.selection);
  }

  public selectNonVisibleUser(event: any, userIndex: any): void {
    this.toggleUserSelection(this.nonVisibleUsers[userIndex]);
    let node = document.getElementsByClassName('avatar-list')[userIndex];
    if (node.className.includes('selected')) {
      node.className = node.className.slice(
        0,
        node.className.indexOf('selected')
      );
    } else {
      node.className += ' selected';
    }
    this.checkNonVisibleUserSelection();
  }

  public checkNonVisibleUserSelection(): boolean {
    return this.selection?.some((item) => this.nonVisibleUsers?.includes(item));
  }

  constructor() {}

  ngOnInit(): void {}
}
