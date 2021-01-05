import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TreeNodeComponent } from './tree-node.component';

@Component({
  selector: 'app-tree-node-on-push',
  templateUrl: './tree-node.component.html',
  styleUrls: ['./tree-node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeNodeOnPushComponent extends TreeNodeComponent {}

