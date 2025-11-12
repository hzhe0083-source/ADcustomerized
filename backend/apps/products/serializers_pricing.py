from rest_framework import serializers


class QuoteOption(serializers.Serializer):
    configId = serializers.IntegerField()
    optionId = serializers.IntegerField()


class QuoteRequestSerializer(serializers.Serializer):
    productId = serializers.UUIDField()
    width = serializers.FloatField()
    height = serializers.FloatField()
    unit = serializers.ChoiceField(choices=['mm', 'cm', 'm'], default='cm')
    quantity = serializers.FloatField(min_value=0.01, default=1)
    options = QuoteOption(many=True, required=False)
    merchant = serializers.CharField(required=False)


class QuoteResponseSerializer(serializers.Serializer):
    unitPrice = serializers.FloatField()
    area = serializers.FloatField()
    quantity = serializers.FloatField()
    subtotal = serializers.FloatField()
    breakdown = serializers.DictField()
