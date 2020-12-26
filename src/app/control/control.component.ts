import { ChangeDetectionStrategy, Component, Input, EventEmitter, Output } from '@angular/core';
import { TreeNode } from '../node';

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ControlComponent {
  @Input()
  currentNode!: TreeNode | null;

  @Output()
  addNode = new EventEmitter<TreeNode>();

  @Output()
  removeNode = new EventEmitter<TreeNode>();

  add(): void {
    const newNode = new TreeNode();
    this.addNode.emit(newNode);
  }
}
