import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { TreeNode } from './tree/tree-node';
import { NodeService, TreeState } from './node.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  constructor(private nodeService: NodeService) {}

  get currentNode(): TreeNode | null {
    return this.nodeService.currentNode;
  }

  get node(): TreeNode {
    return this.nodeService.node;
  }

  get treeState(): TreeState {
    return this.nodeService.treeState;
  }

  ngOnInit(): void {
    this.nodeService.autogenerateNodes(4, this.nodeService.createFirstNode(), 2);
  }

  addNode(node: TreeNode): void {
    this.nodeService.addNode(node, true);
    this.nodeService.updateDepth();
  }

  removeNode(node: TreeNode): void {
    this.nodeService.updateNodeTree(node, this.nodeService.removeNode);
    this.nodeService.updateDepth();
  }
}
