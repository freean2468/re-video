# -*- coding: utf-8 -*- 

import io
import shutil
import os
import time
import enum
import json
from collections import OrderedDict
import sys

targetPath= os.getcwd() + "/../../collections/SB_VIDEO"
savePath= os.getcwd() + "/../../collections/SB_VIDEO_COPY"
target = 'json'
exception = ['1YafTzdBGV0']

def checkException(target):
    for excep in exception:
        if target == excep:
            print(target)
            return True
    return False

def amend(path):
    lst = os.listdir(path)
    for d in lst:
        fileName=d.split(".")[0] 
        fileExtension=d.split(".")[-1]
        if fileExtension == target and not checkException(fileName):
            onTarget = path + "/" + d 
            with io.open(onTarget,"r", encoding="utf-8") as openFile:
                # print(onTarget)
                contents = json.load(openFile)
                # print(contents)

                '''
                for data in contents["data"]:
                    for _idx, __usage in enumerate(data['__usage']):
                        # __usage["___image"]=[]
                        # __usage["___image"].append("")

                        for __idx, ___extra in enumerate(__usage['___extra']):
                            __usage['___extra'][__idx] = ___extra.replace(" T ", " Transitive ")
                            __usage['___extra'][__idx] = __usage['___extra'][__idx].replace(" I ", " Intransitive ")
                            __usage['___extra'][__idx] = __usage['___extra'][__idx].replace(" U ", " Uncountable ")
                            __usage['___extra'][__idx] = __usage['___extra'][__idx].replace(" C ", " Countable ")
                            __usage['___extra'][__idx] = __usage['___extra'][__idx].replace(" S ", " Singular ")
                            __usage['___extra'][__idx] = __usage['___extra'][__idx].replace(" L ", " Linking ")

                            print("wordset : " + contents["root"] + ", ___extra : " + __usage['___extra'][__idx])
                            
                '''
                # old format -> new format code
                
                newContents = OrderedDict()

                newContents["source"] = "0"
                newContents["c"] = []
                newContents["file"] = ""

                for idx, val in enumerate(contents["text"]):
                    c = {}
                    c["st"] = contents["start_timestamp"][idx]
                    c["et"] = contents["end_timestamp"][idx]
                    c["t"] = {}
                    c["t"]["scrt"] = contents["text"][idx]
                    # c["t"]["stc"] = []
                    c["lt"] = contents["literal"][idx]
                    c["pp"] = contents["pharaphrase"][idx]
                    # c["cv"] = {}

                    newContents["c"].append(c)

                # print(newContents)
                
                # startIndex = 0
                # endIndex = contents.find('<h2>')
                # contents="".join((contents[:startIndex],'',contents[endIndex:]))
                # print(contents)
                
                with io.open(savePath + "/" + d,"w", encoding="utf-8") as openFileToWrite:
                    openFileToWrite.write(json.dumps(newContents, ensure_ascii=False, indent="\t"))

amend(targetPath)