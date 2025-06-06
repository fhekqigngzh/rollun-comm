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
    <div>
        <component :is="inputComponent" @click="open" v-model="value" size="small" read-only class="readonly" :placeholder="placeholder"></component>
        <component :is="component" v-model="visible" title="SpEL模版编辑器（严格JSON格式）" width="60%" centered :mask-closable="false" :esc-closable="true">

            <a-textarea v-model="el" :rows="10" placeholder="SpEL模版，必须为严格JSON格式"></a-textarea>

            <a-input-search placeholder="输入单据ID(可选)" v-model="docId" @search="test()" style="margin-top: 12px;">
                <a-button slot="enterButton">测试</a-button>
            </a-input-search>
            <div v-if="error" class="error">{{error}}</div>
            <div v-else-if="result!==undefined" class="result">
                <label style="font-weight: bold;">Result:</label>
                <div v-if="result!==null" :class="{overflow:component==='vxe-modal'}">
                    <json-viewer
                        :value="result"
                        :expand-depth=5
                        :expanded="component==='vxe-modal'"
                        theme="jv-light"
                        copyable
                        boxed
                        sort />
                </div>
                <code v-else style="margin-left: 10px;">null</code>
            </div>

            <div v-if="component==='vxe-modal'" style="margin-top: 10px;text-align: right">
                <a-button type="primary" @click="submit">确定</a-button>
            </div>

            <div slot="footer" v-if="component==='a-modal'">
                <a-button type="primary" @click="submit">确定</a-button>
            </div>
        </component>
    </div>
</template>

<script>
import qs from 'qs'
import {mapState,mapMutations} from 'vuex'

export default {
    name: "NkSpELEditor",
    props:{
        value : String,
        modalComponent:{
            type:String,
            default: 'a-modal'
        },
        placeholder: String
    },
    created() {
        this.component = this.modalComponent;
        if(this.$parent.$options._componentTag==="vxe-table-body"){
            this.component = 'vxe-modal';
            // this.inputComponent = 'vxe-input';
        }
    },
    data(){
        return {
            visible : false,
            el: undefined,
            error: undefined,
            result: undefined,
            component: undefined,
            inputComponent: 'a-input'
        }
    },
    computed:{
        ...mapState('Debug',[
            'docIdSpEL'
        ]),
        docId:{
            get(){
                return this.docIdSpEL;
            },
            set(value){
                this.setDocIdSpEL(value);
            }
        }
    },
    methods:{
        ...mapMutations('Debug',[
            'setDocIdSpEL'
        ]),
        open(){
            this.visible = true;
            this.result = undefined;
            try{
                this.el = this.parse(this.value,2);
                this.error = undefined;
            }catch (e){
                this.el = this.value;
                this.error = undefined;
            }
        },
        submit(){
            try{
                this.$emit("input", this.parse(this.el));
                this.visible = false;
                this.error = undefined;
            }catch (e){
                this.error = e;
            }
        },
        test(){
            if(!this.el||!this.el.trim()){
                this.error = '表达式不能为空';
                this.result = undefined;
                return;
            }
            try{
                this.parse(this.el)
                this.error = undefined;
                this.$http.post("/api/debug/spel/test",qs.stringify({
                    el: this.el,
                    docId : this.docId,
                    isTemplate : true
                })).then(res=>{
                    this.error = res.data.errorMessage;
                    if(res.data.result){
                        this.result = JSON.parse(res.data.result);
                    }else{
                        this.result = res.data.result;
                    }
                })
            }catch (e){
                this.error = e;
                this.result = undefined;
            }
        },
        parse(value,space){
            const v = value && value.replace(/\s/g,'');
            if(!v)
                return v;
            return JSON.stringify(JSON.parse(value),null,space)
        }
    }
}
</script>

<style scoped lang="less">
    .result{
        margin-top: 12px;
    }
    .error{
        color: #ff4d4f;
        margin-top: 12px;
        background-color: #fafafa;
        padding: 4px;
    }
    .overflow{
        max-height: 300px;overflow: auto
    }
    ::v-deep.readonly{
        cursor: pointer;
        input{
            cursor: pointer;
        }
    }
</style>