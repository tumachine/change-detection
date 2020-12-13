import { NgModule } from '@angular/core';
import { TreeNodeComponent } from './tree-node/tree-node.component';
import { TreeComponent } from './tree.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [TreeNodeComponent, TreeComponent],
  exports: [
    TreeComponent
  ],
  imports: [CommonModule]
})
export class TreeModule {}
