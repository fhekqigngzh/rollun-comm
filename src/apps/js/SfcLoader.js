/*
 * 	This file is part of ELCube.
 *	ELCube is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as published by
 *	the Free Software Foundation, either version 3 of the License, or
 *	(at your option) any later version.
 *	ELCube is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *	You should have received a copy of the GNU Affero General Public License
 *	along with ELCube.  If not, see <https://www.gnu.org/licenses/>.
 */
import { loadModule } from "vue3-sfc-loader/dist/vue2-sfc-loader";
import { Modal } from "ant-design-vue";

export default function (Vue, modules, enable){

    function compile(componentName, template, modules){
        return () => {

            return new Promise((resolve,reject)=>{
                let i18n,markdown;
                loadModule(
                    componentName+".vue",
                    {
                        // 禁用缓存，确保组件可以更新
                        moduleCache: Object.assign({},modules),
                        getFile() {
                            return template;
                        },
                        addStyle(textContent) {
                            if((textContent = textContent.trim()))
                                document.head.append(Object.assign(document.createElement('style'), { textContent }));
                        },
                        customBlockHandler(block) {
                            if ( block.type === 'i18n' ){
                                i18n = block.content;
                            }
                            if ( block.type === 'docs' ){
                                markdown = block.content;
                            }
                        }
                    }
                ).then(component=>{
                    if(i18n){
                        component.__i18n = [i18n];
                    }
                    if(markdown){
                        component.__docs = markdown.trim();
                    }
                    resolve(component);
                }).catch((e)=>{
                    Modal.error({
                        centered: true,
                        title: '['+componentName+']编译错误',
                        content: e.name + " : "+e.message
                    });
                    reject(e);
                });
            });
        }
    }

    function loadVueTemplate(componentName, template){
        if(!enable){
            return Promise.reject('sfc 未启用');
        }
        return Vue.component(componentName,compile(componentName, template, modules));
    }

    function reloadVueResources(){

        if(!enable){
            return Promise.resolve({count:0});
        }

        return new Promise((resolve,reject)=>{
            Vue.prototype.$http.instanceNone.get("/api/def/resources/vue")
                .then(res=>{
                    let count = 0;
                    for(let componentName in res.data){
                        if(res.data.hasOwnProperty(componentName)){
                            Vue.component(componentName,compile(componentName, res.data[componentName], modules));
                        }
                        count ++;
                    }
                    resolve({
                        count,
                        data:res.data
                    });
                }).catch(reject);
        })
    }

    return {
        compile,
        loadVueTemplate,
        reloadVueResources
    }
}