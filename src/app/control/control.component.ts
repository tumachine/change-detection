import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NodeService, TreeNodeAsComponent } from '../node.service';

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

  toggleDetectionMethod(): void {
    this.nodeService.toggleDetectionMethod();
  }

  toggleDetectionWithChildren(): void {
    this.nodeService.toggleDetectionMethodWithChildren();
  }
}
