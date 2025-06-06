<!--
	This file is part of ELCube.
	ELCube is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	ELCube is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	You should have received a copy of the GNU Affero General Public License
	along with ELCube.  If not, see <https://www.gnu.org/licenses/>.
-->
<template>
    <nk-def-card>
        <nk-form :col="1" :edit="editMode" style="width:300px;">
            <nk-form-item title="列">
                {{def.col}}
                <a-input-number v-model="def.col" slot="edit" size="small" :min="1" :max="4" />
            </nk-form-item>
            <nk-form-item title="标题宽">
                {{def.titleWidth}}
                <a-input-number v-model="def.titleWidth" slot="edit" size="small" :min="20" :max="300" />
            </nk-form-item>
            <slot name="header"></slot>
        </nk-form>
        <vxe-toolbar v-if="editMode">
            <template v-slot:buttons>
                <vxe-button status="perfect" size="mini" @click="add()">新增</vxe-button>
                <vxe-button status="perfect" size="mini" @click="rowExpandClear()">收起</vxe-button>
            </template>
        </vxe-toolbar>
        <vxe-table
            ref="xTable"
            row-key
            auto-resize
            size="mini"
            border=inner
            show-header-overflow="tooltip"
            show-overflow="tooltip"
            resizable
            highlight-hover-row
            :edit-config="{trigger: 'click', mode: 'row', showIcon: editMode, activeMethod}"
            :data="def.items"
            @edit-actived="rowEditActived"
            @edit-closed="rowEditClosed"
            @toggle-row-expand="rowExpand"
        >
            <vxe-table-column title="KEY"
                              field="key"
                              width="17%"
                              :edit-render="{name:'$input',events:{change:keyChanged}}"></vxe-table-column>
            <vxe-table-column title="描述"
                              field="name"
                              width="17%"
                              :edit-render="{name:'$input'}"></vxe-table-column>
            <vxe-table-column title="输入框"
                              field="inputType"
                              width="17%"
                              :edit-render="{name:'$select',options:inputTypeDefs,events:{change:inputTypeChanged}}"></vxe-table-column>
            <vxe-table-column title="触发计算"
                              field="calcTrigger"
                              width="12%"
                              :edit-render="{name:'$switch',props: {'open-value':true,'close-value':false}}"
                              :formatter="boolFormat"></vxe-table-column>
            <vxe-table-column title="计算顺序"
                              field="calcOrder"
                              width="12%"
                              :edit-render="{name:'$input', props: {type: 'number',min:1, max:4}}"></vxe-table-column>
            <vxe-table-column title="列宽"
                              field="col"
                              width="10%"
                              :edit-render="{name:'$input', props: {type: 'number',min:1, max:4}}"></vxe-table-column>
            <vxe-table-column type="expand"
                              field="">
                <template v-slot="{seq,items}">
                    <span v-if="editMode && sortable" class="drag-btn" style="margin-left: 10px;">
                        <a-icon type="swap" rotate="90" />
                    </span>
                    <span v-if="editMode" style="margin-left: 10px;" @click="$nkSortableRemove(def.items,seq)">
                        <a-icon type="delete" />
                    </span>
                </template>
                <template #content="{ row }">
                    <nk-form :edit="editMode" :col="2">
                        <nk-form-item title="是否非空">
                            {{row.required?'是':'否'}}
                            <a-switch slot="edit" size="small" v-model="row.required" />
                        </nk-form-item>
                        <nk-form-item title="校验提示">
                            {{row.message}}
                            <a-input slot="edit" size="small" v-model="row.message"></a-input>
                        </nk-form-item>
                        <nk-form-item title="右对齐">
                            {{row.alignRight?'是':'否'}}
                            <a-switch slot="edit" size="small" v-model="row.alignRight" />
                        </nk-form-item>
                        <nk-form-item title="自定义样式">
                            {{row.style}}
                            <a-input slot="edit" size="small" v-model="row.style"></a-input>
                        </nk-form-item>
                        <nk-form-item title="控制">
                            {{row.control===1 ?'读写':(row.control===0 ?'只读':'隐藏')}}
                            <a-select slot="edit" size="small" v-model="row.control" >
                                <a-select-option :key="1" >读写</a-select-option>
                                <a-select-option :key="0" >只读</a-select-option>
                                <a-select-option :key="-1">隐藏</a-select-option>
                            </a-select>
                        </nk-form-item>
                        <nk-form-item title="控制EL">
                            {{row.spELControl}}
                            <nk-sp-el-editor slot="edit" v-model="row.spELControl"></nk-sp-el-editor>
                        </nk-form-item>
                        <nk-form-item title="值EL条件">
                            {{row.spELTriggers}}
                            <a-select slot="edit" size="small" v-model="row.spELTriggers" mode="multiple" >
                                <a-select-option key="ALWAYS">ALWAYS</a-select-option>
                                <a-select-option key="INIT">INIT</a-select-option>
                                <a-select-option key="BLANK">BLANK</a-select-option>
                            </a-select>
                        </nk-form-item>
                        <nk-form-item title="值EL">
                            {{row.spELContent}}
                            <nk-sp-el-editor slot="edit" v-model="row.spELContent"></nk-sp-el-editor>
                        </nk-form-item>
                    </nk-form>
                    <component v-if="row===activeRow && fieldDefComponent"
                               :is="fieldDefComponent"
                               :edit-mode="editMode"
                               v-model="row.inputOptions"
                    ></component>
                </template>
            </vxe-table-column>
        </vxe-table>
    </nk-def-card>
</template>

<script>
import MixinDef from "./MixinDef";
import MixinSortable from "../../../utils/MixinSortable";
import MixinDynamicDef from "./MixinDynamicDef";

export default {
    mixins:[new MixinDef({}),MixinSortable(),MixinDynamicDef],
    data(){
        return {
        }
    },
    mounted() {
        this.nk$callDef()
            .then(res=>{
                this.inputTypeDefs = res;
                this.inputTypeDefs.push({value:'-',label:'-- | 分隔'})
            });
    },
    methods:{

        add(){
            const index = this.def.items.length||'';
            let newItem = {
                key : 'key'+index,
                name: '字段'+index,
                col:1,
                inputType: this.inputTypeDefs[0].value,
                calcTrigger:'',
                calcOrder:1,
                required:false,
                control:1,
                spELContent:'',
                spELTriggers:[],
                eval:''
            };
            this.def.items.push(newItem);
            this.$refs.xTable.loadData(this.def.items).then(() => this.$refs.xTable.setActiveRow(newItem));
        },
    }
}
</script>

<style scoped>

</style>