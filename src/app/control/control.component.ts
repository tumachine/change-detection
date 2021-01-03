import { ChangeDetectionStrategy, Component, Input, EventEmitter, Output } from '@angular/core';
import { TreeNode } from '../node';
import { createTreeNodeComponent, NodeService, TreeNodeValue } from '../node.service';

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
  removeNode = new EventEmitter<TreeNode<TreeNodeValue>>();

  constructor(private nodeService: NodeService) {}

  startRecording(): void {
    this.nodeService.startRecording();
  }

  stopRecording(): void {
    this.nodeService.stopRecording();
  }

  reset(): void {
    this.nodeService.reset();
  }

  colorHistory(): void {
    this.nodeService.showChecked();
  }

  add(): void {
    this.nodeService.addNode(createTreeNodeComponent(null, [], []));
  }

  remove(): void {
    this.nodeService.removeNode();
  }
}
