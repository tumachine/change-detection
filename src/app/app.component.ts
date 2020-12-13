import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TreeNode } from './tree/tree-node';
import { NodeService } from './node.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor(private nodeService: NodeService) {}

  get currentNode(): TreeNode | null {
    return this.nodeService.currentNode;
  }

  get nodes(): TreeNode[] {
    return this.nodeService.nodes;
  }
}
