import { NgModule } from '@angular/core';
import { TreeNodeComponent } from './tree-node/tree-node.component';
import { TreeComponent } from './tree.component';
import { CommonModule } from '@angular/common';
import { TreeNodeOnPushComponent } from './tree-node/tree-node-on-push.component';

@NgModule({
  declarations: [TreeNodeComponent, TreeNodeOnPushComponent, TreeComponent],
  exports: [
    TreeComponent
  ],
  imports: [CommonModule]
})
export class TreeModule {}
