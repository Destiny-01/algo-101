from pyteal import *


class Request:
    class Variables:
        title = Bytes("TITLE")
        image = Bytes("IMAGE")
        description = Bytes("DESCRIPTION")
        min_donation = Bytes("MIN_DONATION")
        donated = Bytes("DONATED")
        createdAt = Bytes("CREATED_AT")

    class AppMethods:
        donate = Bytes("donate")
        edit = Bytes("edit")

    def application_creation(self):
        return Seq([
            Assert(Txn.application_args.length() == Int(5)),
            Assert(Txn.note() == Bytes("requestss-app:uv1")),
            App.globalPut(self.Variables.title, Txn.application_args[0]),
            App.globalPut(self.Variables.image, Txn.application_args[1]),
            App.globalPut(self.Variables.description, Txn.application_args[2]),
            App.globalPut(self.Variables.min_donation, Btoi(Txn.application_args[3])),
            App.globalPut(self.Variables.createdAt, Btoi(Txn.application_args[4])),
            App.globalPut(self.Variables.donated, Int(0)),
            Approve()
        ])

    def donate(self):
        valid_number_of_transactions = Global.group_size() == Int(2)

        valid_payment_to_seller = And(
            Gtxn[1].type_enum() == TxnType.Payment,
            Gtxn[1].receiver() == Global.creator_address(),
            Gtxn[1].amount() >= App.globalGet(self.Variables.min_donation),
            Gtxn[1].sender() == Gtxn[0].sender(),
        )

        can_donate = And(valid_number_of_transactions,
                      valid_payment_to_seller)
        
        update_state = Seq([
            App.globalPut(self.Variables.donated, Btoi(Txn.application_args[1])),
            Approve()
        ])

        return If(can_donate).Then(update_state).Else(Reject())

    def edit(self):
        is_owner = Txn.sender() == Global.creator_address()

        update_state = Seq([
            Assert(Txn.application_args.length() == Int(5)),
            App.globalPut(self.Variables.title, Txn.application_args[1]),
            App.globalPut(self.Variables.image, Txn.application_args[2]),
            App.globalPut(self.Variables.description, Txn.application_args[3]),
            App.globalPut(self.Variables.min_donation, Btoi(Txn.application_args[4])),
            Approve()
        ])

        return If(is_owner).Then(update_state).Else(Reject())

    def application_deletion(self):
        return Return(Txn.sender() == Global.creator_address())

    def application_start(self):
        return Cond(
            [Txn.application_id() == Int(0), self.application_creation()],
            [Txn.on_completion() == OnComplete.DeleteApplication, self.application_deletion()],
            [Txn.application_args[0] == self.AppMethods.donate, self.donate()],
            [Txn.application_args[0] == self.AppMethods.edit, self.edit()]
        )

    def approval_program(self):
        return self.application_start()

    def clear_program(self):
        return Return(Int(1))
