import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { NodeService } from './node.service';
import { TreeNode } from './node';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor(public nodeService: NodeService, private cdRef: ChangeDetectorRef) {}

  root = this.nodeService.root;
  depth = this.nodeService.depth;
  current = this.nodeService.currentComponent;

  addNode(node: TreeNode): void {
    this.nodeService.addNode(node);
  }

  removeNode(): void {
    this.nodeService.removeNode();
  }
}
