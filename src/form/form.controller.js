const FormModel = require('./form.model');

module.exports = {
    getForms: (req, res) => {
        const query = req.query ? req.query : {};
        FormModel
            .find(query)
            .then(forms => res.send(forms));
    },

    getForm: function (req, res) {
        const formId = req.params['formId'];
        FormModel
            .findById(formId)
            .then(form => res.send(form));
    },

    getFormInputs: function (req, res) {
        const formId = req.params['formId'];
        FormModel
            .findById(formId)
            .then(form => res.send(form.inputs));
    },

    getFormRecords: function (req, res) {
        const formId = req.params['formId'];
        FormModel
            .findById(formId)
            .then(form => res.send(form.records));
    },

    getRecord: function (req, res) {
        const recordId = req.params['recordId'];
        FormModel
            .findOne(
                {"records._id": recordId},
                {records: {$elemMatch: {_id: recordId}}}
            )
            .then(form => res.send(form.records[0]))
    },

    addForm: function (req, res) {
        const form = new FormModel(req.body);
        form
            .save()
            .then(savedModel => res.send(savedModel))
    },

    addFormRecord: async function (req, res) {
        const formId = req.params['formId'];
        const record = req.body;
        const createdRecord = (new FormModel).records.create(record);
        FormModel
            .findByIdAndUpdate(
                formId,
                {$push: {records: createdRecord}},
            )
            .then(_ => res.send(createdRecord));
    },

    removeRecord: function (req, res) {
        const recordId = req.params['recordId'];

        FormModel
            .findOne(
                {"records._id": recordId},
                {_id: 0, records: {$elemMatch: {_id: recordId}}}
            )
            .then(form => {
                const recordToRemove = form.records[0];
                FormModel
                    .update({},
                        {$pull: {"records": {_id: recordId}}},
                        {multi: true}
                    )
                    .then(_ => res.send(recordToRemove));
            });

    },

    updateRecord: function (req, res) {
        const recordId = req.params['recordId'];
        const record = req.body;
        record._id = recordId;
        FormModel
            .findOneAndUpdate(
                {"records._id": recordId},
                {$set: {"records.$": record}},
                {new: true}
            )
            .then(_ => {
                FormModel.findOne(
                    {"records._id": recordId},
                    {records: {$elemMatch: {_id: recordId}}}
                )
                    .then(updatedForm => res.send(updatedForm.records[0]));
            });
    }
};