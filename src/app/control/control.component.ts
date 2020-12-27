import { ChangeDetectionStrategy, Component, Input, EventEmitter, Output } from '@angular/core';
import { TreeNode } from '../node';
import { NodeService } from '../node.service';

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
  removeNode = new EventEmitter<TreeNode>();

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
    this.nodeService.addNode(new TreeNode());
  }

  remove(): void {
    this.nodeService.removeNode();
  }
}
