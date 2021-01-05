import { ChangeDetectionStrategy, Component, Input, EventEmitter, Output } from '@angular/core';
import { TreeNode } from '../node';
import { NodeService, TreeNodeAsComponent, TreeNodeValue } from '../node.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ControlComponent {
  currentNode$ = this.nodeService.currentNode;
  enableRecording$ = this.nodeService.enableRecording;

  constructor(private nodeService: NodeService) {}

  toggleRecording(): void {
    this.nodeService.toggleRecording();
  }

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
    const node = new TreeNodeAsComponent();
    node.setup(null, null, [], []);
    this.nodeService.addNode(node);
  }

  remove(): void {
    this.nodeService.removeNode();
  }
}
