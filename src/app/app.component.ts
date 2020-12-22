import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { NodeService } from './node.service';
import { TreeNode } from './node';
import { TreeNodeComponent } from './tree/tree-node/tree-node.component';

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
  current = this.nodeService.currentNode;

  addNode(node: TreeNode<TreeNodeComponent>): void {
    this.nodeService.addNode(node);
  }

  removeNode(): void {
    this.nodeService.removeNode();
  }
}
