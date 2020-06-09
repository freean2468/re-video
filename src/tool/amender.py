# -*- coding: utf-8 -*- 

import io
import shutil
import os
import time
import enum
import json
from collections import OrderedDict
import sys
import pymongo

client = pymongo.MongoClient(
   "mongodb+srv://<username>:<password>@<cluster-url>/test?retryWrites=true&w=majority")
db = client.test

targetPath= os.getcwd() + "/dictionary_archive"
savePath= os.getcwd() + "/dictionary_archive_copy"
target = 'json'
exception = []

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

                newContents["root"] = contents["root"]
                newContents["redirection"] = contents["redirection"]
                newContents["from"] = []
                for elm in newContents["from"]:
                    newContents["from"].append(elm)

                newContents["data"] = []

                for data in contents["data"]:
                    _temp = OrderedDict()

                    _temp["_usage"] = data["_usage"]

                    # print(contents["root"])
                    _temp["_speech"] = []
                    for elm in data["_speech"]:
                        _temp["_speech"].append(elm)

                    _temp["_video"] = data["_video"]
                    _temp["_chunks"] = []
                    for elm in data["_chunks"]:
                        _temp["_chunks"].append(elm)

                    _temp["_text"] = []

                    newContents["data"].append(_temp)

                # print(newContents)
                
                # startIndex = 0
                # endIndex = contents.find('<h2>')
                # contents="".join((contents[:startIndex],'',contents[endIndex:]))
                # print(contents)
                
                with io.open(savePath + "/" + d,"w", encoding="utf-8") as openFileToWrite:
                    openFileToWrite.write(json.dumps(newContents, ensure_ascii=False, indent="\t"))

amend(targetPath)