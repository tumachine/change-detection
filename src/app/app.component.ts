import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NodeService, TreeNodeValue } from './node.service';
import { TreeNode } from './node';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor(public nodeService: NodeService) {}

  root = this.nodeService.root;
  depth = this.nodeService.depth;
  current = this.nodeService.currentNode;

  addNode(node: TreeNode<TreeNodeValue>): void {
    this.nodeService.addNode(node);
  }

  removeNode(): void {
    this.nodeService.removeNode();
  }
}
