import { ChangeDetectionStrategy, Component, Input, EventEmitter, Output } from '@angular/core';
import { TreeNode } from '../node';
import { TreeNodeComponent } from '../tree/tree-node/tree-node.component';
import { defaultTreeNodeValue, TreeNodeValue, deepCloneFunc } from '../node.service';

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ControlComponent {
  @Input()
  currentNode!: TreeNode<TreeNodeValue> | null;

  @Output()
  addNode = new EventEmitter<TreeNode<TreeNodeValue>>();

  @Output()
  removeNode = new EventEmitter<TreeNode<TreeNodeValue>>();

  add(): void {
    const newNode = new TreeNode<TreeNodeValue>(null, { ...defaultTreeNodeValue}, defaultTreeNodeValue);
    newNode.value.props = { current: true };
    this.addNode.emit(newNode);
  }
}
